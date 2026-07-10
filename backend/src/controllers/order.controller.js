const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const orderService = require('../services/order.service');
const cartService = require('../services/cart.service');
const emailService = require('../services/email.service');
const { orderProcessingQueue } = require('../jobs/queueJobs/orderProcessingQueue');

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;
  
  // 1. Get cart
  const cart = await cartService.getCart(req.user._id);
  if (!cart.items || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }
  
  // 2. Create order
  const order = await orderService.createOrder({
    user: req.user._id,
    items: cart.items,
    shippingAddress,
    paymentMethod,
    subtotal: cart.subtotal,
    discount: cart.discount,
    totalAmount: cart.total,
    couponCode: cart.couponCode,
    notes
  });
  
  // 3. Clear cart
  await cartService.clearCart(req.user._id);
  
  // 4. Queue order processing (non‑blocking, optional)
  await orderProcessingQueue.add('process-order', { orderId: order._id });
  
  // 5. Send confirmation email – catch errors and log them, but don't let them crash the response
  let emailSent = false;
  try {
    await emailService.sendOrderConfirmation(order, req.user);
    emailSent = true;
  } catch (error) {
    logger.error('Failed to send order confirmation email:', error);
    // Email failure is not critical for the order creation; we continue
  }
  
  // 6. Respond with appropriate message
  const message = emailSent 
    ? 'Order created successfully. Confirmation email sent.' 
    : 'Order created successfully, but failed to send confirmation email.';
  
  res.status(201).json(new ApiResponse(201, order, message));
});

const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const orders = await orderService.getUserOrders(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    status
  });
  
  res.status(200).json(new ApiResponse(200, orders, 'Orders retrieved'));
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const order = await orderService.getOrderById(id, req.user._id, req.user.role);
  
  res.status(200).json(new ApiResponse(200, order, 'Order retrieved'));
});

const getOrderByNumber = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  
  const order = await orderService.getOrderByNumber(orderNumber, req.user._id, req.user.role);
  
  res.status(200).json(new ApiResponse(200, order, 'Order retrieved'));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const order = await orderService.cancelOrder(id, req.user._id, reason);
  
  await emailService.sendOrderStatusUpdate(order, req.user, 'cancelled');
  
  res.status(200).json(new ApiResponse(200, order, 'Order cancelled successfully'));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, description } = req.body;
  
  const order = await orderService.updateOrderStatus(id, status, req.user._id, description);
  
  if (['confirmed', 'shipped', 'delivered'].includes(status)) {
    await emailService.sendOrderStatusUpdate(order, order.user, status);
  }
  
  res.status(200).json(new ApiResponse(200, order, 'Order status updated'));
});

const trackOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const tracking = await orderService.trackOrder(id, req.user._id);
  
  res.status(200).json(new ApiResponse(200, tracking, 'Order tracking info retrieved'));
});

const getOrderTimeline = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const timeline = await orderService.getOrderTimeline(id, req.user._id);
  
  res.status(200).json(new ApiResponse(200, timeline, 'Order timeline retrieved'));
});

const requestReturn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body;
  
  const result = await orderService.requestReturn(id, req.user._id, { reason, description });
  
  res.status(200).json(new ApiResponse(200, result, 'Return request submitted'));
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const invoice = await orderService.generateInvoice(id, req.user._id);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.orderNumber}.pdf`);
  res.send(invoice.buffer);
});

const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getOrderStats(req.user._id);
  
  res.status(200).json(new ApiResponse(200, stats, 'Order stats retrieved'));
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  cancelOrder,
  updateOrderStatus,
  trackOrder,
  getOrderTimeline,
  requestReturn,
  downloadInvoice,
  getOrderStats
};