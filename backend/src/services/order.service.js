const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Cart = require('../models/Cart.model');
const Coupon = require('../models/Coupon.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const { orderProcessingQueue } = require('../jobs/queueJobs/orderProcessingQueue');

class OrderService { 

  async createOrder(orderData) {
    console.log('Received orderData:', JSON.stringify(orderData, null, 2));

    if (!orderData.items || orderData.items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }   

    // Transform items to match the Order schema
    const transformedItems = orderData.items.map((item) => {
      let productId = item.productId || item.product?._id || item.product;

      if (!productId) {
        console.error('Invalid item structure:', item);
        throw new ApiError(400, 'Product ID is required for each order item');
      }

      return {
        product: productId,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        variant: item.variant || new Map(),
        name: item.product?.name || item.name,
        sku: item.product?.sku || item.sku,
        image: item.product?.images?.[0]?.url || item.image
      };
    });

    // Prepare order data with all required fields
    const preparedOrderData = {
      user: orderData.user,
      items: transformedItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      totalAmount: orderData.totalAmount,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode,
      notes: orderData.notes || '',
      shippingCost: orderData.shippingCost || 0,
      tax: orderData.tax || 0,
      shippingMethod: orderData.shippingMethod || 'standard',
      status: 'pending',
      paymentStatus: 'pending'
    };

    const order = new Order(preparedOrderData);
    console.log('Order after transformation:', JSON.stringify(order, null, 2));

    for (const item of order.items) {
      if (!item.product) {
        console.error('Invalid item structure after transformation:', item);
        throw new ApiError(400, 'Product ID is required for each order item');
      }

      const product = await Product.findById(item.product);
      if (!product) {
        throw new ApiError(404, `Product not found with ID: ${item.product}`);
      }

      if (product.quantity < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.quantity}`
        );
      }

      product.quantity -= item.quantity;
      product.soldQuantity += item.quantity;
      await product.save();

      item.name = product.name;
      item.sku = product.sku || `SKU-${product._id}`;
      item.price = item.price || product.price;
      item.total = item.price * item.quantity;
      item.image = product.images && product.images[0] ? product.images[0].url : null;
    }

    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
      if (coupon) {
        await coupon.markAsUsed(order.user, order._id);
        order.discount = coupon.calculateDiscount(order.subtotal);
        order.totalAmount = order.subtotal - order.discount;
      }
    }

    if (!order.totalAmount || order.totalAmount === 0) {
      order.totalAmount =
        order.subtotal - (order.discount || 0) + (order.shippingCost || 0) + (order.tax || 0);
    }

    await order.save();

    if (order.addTimelineEntry) {
      order.addTimelineEntry('pending', 'Order created', order.user);
      await order.save();
    }

    // Safely add to queue - handle case where queue is not available
    try {
      const { orderProcessingQueue } = require('../jobs/queueJobs/orderProcessingQueue');
      if (orderProcessingQueue && typeof orderProcessingQueue.add === 'function') {
        await orderProcessingQueue.add('send-order-confirmation', { orderId: order._id });
        await orderProcessingQueue.add('process-order', { orderId: order._id });
      } else {
        // Process synchronously if queue is not available
        console.log('Queue not available, processing order synchronously');
        order.status = 'processing';
        order.addTimelineEntry('processing', 'Order is being processed', order.user);
        await order.save();
      }
    } catch (queueError) {
      console.error('Queue error (non-fatal):', queueError.message);
      // Don't throw - order is already created
    }

    // Send email (don't await, but catch errors)
    emailService.sendOrderConfirmation(order, await User.findById(order.user)).catch((err) => {
      console.error('Failed to send order confirmation email:', err);
    });

    return order;
  }

  async getUserOrders(userId, { page = 1, limit = 10, status = null }) {
    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name images slug'),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getOrderById(orderId, userId, userRole = 'user') {
    const query = userRole === 'admin' ? { _id: orderId } : { _id: orderId, user: userId };

    const order = await Order.findOne(query)
      .populate('items.product', 'name images slug')
      .populate('user', 'name email phone');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  async getOrderByNumber(orderNumber, userId, userRole = 'user') {
    const query = userRole === 'admin' ? { orderNumber } : { orderNumber, user: userId };

    const order = await Order.findOne(query)
      .populate('items.product', 'name images slug')
      .populate('user', 'name email phone');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new ApiError(400, 'Order cannot be cancelled at this stage');
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity, soldQuantity: -item.quantity }
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    await order.save();

    return order;
  }

  async updateOrderStatus(orderId, status, userId, description = '') {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    await order.updateStatus(status, userId, description);

    if (status === 'delivered') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.purchaseCount += item.quantity;
          await product.save();
        }
      }
    }

    return order;
  }

  async trackOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId }).select(
      'status trackingNumber trackingUrl timeline estimatedDelivery'
    );

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return {
      status: order.status,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      timeline: order.timeline
    };
  }

  async getOrderTimeline(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId }).select('timeline');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order.timeline;
  }

  async requestReturn(orderId, userId, { reason, description }) {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status !== 'delivered') {
      throw new ApiError(400, 'Only delivered orders can be returned');
    }

    const daysSinceDelivery = (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 30) {
      throw new ApiError(400, 'Return window has expired (30 days)');
    }

    order.status = 'return_requested';
    order.addTimelineEntry(
      'return_requested',
      `Return requested: ${reason} - ${description}`,
      userId
    );
    await order.save();

    return {
      message: 'Return request submitted successfully',
      orderId: order._id
    };
  }

  async generateInvoice(orderId, userId) {
    const order = await this.getOrderById(orderId, userId);

    const PDFDocument = require('pdfkit');
    const buffer = [];
    const doc = new PDFDocument();

    doc.on('data', buffer.push.bind(buffer));
    doc.on('end', () => {});

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.moveDown();

    doc.text('Billing Address:');
    doc.text(order.shippingAddress.fullName);
    doc.text(order.shippingAddress.addressLine1);
    if (order.shippingAddress.addressLine2) doc.text(order.shippingAddress.addressLine2);
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`
    );
    doc.text(order.shippingAddress.country);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    let y = doc.y;
    let total = 0;

    order.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      doc.text(`${index + 1}. ${item.name} x ${item.quantity} = $${itemTotal.toFixed(2)}`, {
        continued: true
      });
      doc.y = y + (index + 1) * 15;
    });

    doc.moveDown();
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`);
    if (order.discount > 0) doc.text(`Discount: -$${order.discount.toFixed(2)}`);
    doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`);
    doc.text(`Tax: $${order.tax.toFixed(2)}`);
    doc.fontSize(14).text(`Total: $${order.totalAmount.toFixed(2)}`, { bold: true });

    doc.end();

    return {
      buffer: Buffer.concat(buffer),
      orderNumber: order.orderNumber
    };
  }

  async getOrderStats(userId) {
    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    return (
      stats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      }
    );
  }
}

module.exports = new OrderService();
