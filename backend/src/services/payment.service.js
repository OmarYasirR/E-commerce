let Razorpay = null;
let razorpay = null;

// Only initialize Razorpay if credentials are provided
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully');
  } catch (error) {
    console.warn('Razorpay initialization failed:', error.message);
  }
} else {
  console.warn('Razorpay credentials not provided. Razorpay payments will be disabled.');
}

const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');
const ApiError = require('../utils/ApiError');

let stripe = null;

const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    }
    stripe = require('stripe')(secretKey);
    console.log('Stripe initialized with key:', secretKey.substring(0, 10) + '...');
  }
  return stripe;
};

class PaymentService {
  async createPaymentIntent(order, paymentMethod = 'stripe') {
    console.log(process.env.STRIPE_SECRET_KEY);
    // logging request url
    console.log('Creating payment intent for order:', order._id, 'with method:', paymentMethod);

    if (paymentMethod === 'stripe') {
      console.log('payment method is stripe');
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new ApiError(500, 'Stripe is not configured');
      }

      const stripeInstance = getStripe();

      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100),
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber
        }
      });

      const payment = new Payment({
        order: order._id,
        user: order.user,
        paymentMethod: 'stripe',
        amount: order.totalAmount,
        paymentIntentId: paymentIntent.id,
        stripe: {
          paymentIntent: paymentIntent.id,
          clientSecret: paymentIntent.client_secret
        }
      });

      await payment.save();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      };
    } else if (paymentMethod === 'razorpay') {
      if (!razorpay) {
        throw new ApiError(500, 'Razorpay is not configured');
      }

      const options = {
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString()
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const payment = new Payment({
        order: order._id,
        user: order.user,
        paymentMethod: 'razorpay',
        amount: order.totalAmount,
        razorpay: {
          orderId: razorpayOrder.id
        }
      });

      await payment.save();

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    }

    throw new ApiError(400, 'Invalid payment method');
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    // Check if payment is already successful
    if (payment.paymentStatus === 'success') {
      console.log(`Payment ${paymentIntentId} already succeeded`);
      return payment;
    }

    const stripeInstance = getStripe();

    // Retrieve the PaymentIntent first to check its status
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Already succeeded, just update our database
      await payment.updateStatus('success');
      return payment;
    }

    if (paymentIntent.status === 'processing') {
      // Still processing, wait or return status
      return { status: 'processing', message: 'Payment is being processed' };
    }

    // Only confirm if status is requires_confirmation or requires_payment_method
    if (
      paymentIntent.status === 'requires_confirmation' ||
      paymentIntent.status === 'requires_payment_method'
    ) {
      const confirmedIntent = await stripeInstance.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      if (confirmedIntent.status === 'succeeded') {
        await payment.updateStatus('success');
      }

      return confirmedIntent;
    }

    return paymentIntent;
  }

  async getPaymentByOrder(orderId, userId) {
    const payment = await Payment.findOne({ order: orderId, user: userId });
    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    return payment;
  }

  async processRefund(orderId, amount, reason, userId) {
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    let refund;

    if (payment.paymentMethod === 'stripe') {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new ApiError(500, 'Stripe is not configured');
      }

      refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: {
          orderId: orderId.toString(),
          reason
        }
      });
    } else if (payment.paymentMethod === 'razorpay') {
      if (!razorpay) {
        throw new ApiError(500, 'Razorpay is not configured');
      }

      refund = await razorpay.payments.refund(payment.razorpay.paymentId, {
        amount: Math.round(amount * 100),
        notes: {
          reason
        }
      });
    } else {
      throw new ApiError(400, 'Refunds not supported for this payment method');
    }

    const refundRecord = await payment.processRefund(amount, reason, userId);

    return refundRecord;
  }

  async getAvailablePaymentMethods() {
    const methods = [
      {
        id: 'cod',
        name: 'Cash on Delivery',
        icon: 'cash',
        enabled: true,
        currencies: ['USD', 'EUR', 'GBP', 'INR']
      }
    ];

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY) {
      methods.unshift({
        id: 'stripe',
        name: 'Credit/Debit Card',
        icon: 'credit_card',
        enabled: true,
        currencies: ['USD', 'EUR', 'GBP']
      });
    }

    if (razorpay && process.env.RAZORPAY_KEY_ID) {
      methods.unshift({
        id: 'razorpay',
        name: 'Razorpay',
        icon: 'razorpay',
        enabled: true,
        currencies: ['INR']
      });
    }

    return methods;
  }

  async handleStripeWebhook(payload, signature) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new ApiError(500, 'Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
        if (payment) {
          await payment.updateStatus('success');
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        const failedPayment = await Payment.findOne({ paymentIntentId: failedIntent.id });
        if (failedPayment) {
          await failedPayment.updateStatus('failed', {
            reason: failedIntent.last_payment_error?.message
          });
        }
        break;
    }

    return { received: true };
  }

  async handleRazorpayWebhook(payload) {
    if (!razorpay) {
      throw new ApiError(500, 'Razorpay is not configured');
    }

    const { event, payload: webhookPayload } = payload;

    if (event === 'payment.captured') {
      const payment = await Payment.findOne({ 'razorpay.orderId': webhookPayload.order.entity.id });
      if (payment) {
        payment.razorpay.paymentId = webhookPayload.payment.entity.id;
        payment.razorpay.signature = webhookPayload.payment.entity.signature;
        await payment.updateStatus('success');
      }
    }

    return { received: true };
  }

  async getPaymentHistory(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ user: userId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('order', 'orderNumber status'),
      Payment.countDocuments({ user: userId })
    ]);

    return {
      payments: payments.map((p) => p.getSummary()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async initiateCOD(order) {
    const payment = new Payment({
      order: order._id,
      user: order.user,
      paymentMethod: 'cod',
      amount: order.totalAmount,
      paymentStatus: 'pending'
    });

    await payment.save();

    return payment;
  }

  async verifyRazorpayPayment(orderId, paymentId, signature) {
    if (!razorpay) {
      throw new ApiError(500, 'Razorpay is not configured');
    }

    const crypto = require('crypto');
    const payment = await Payment.findOne({ order: orderId });

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${payment.razorpay.orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new ApiError(400, 'Invalid payment signature');
    }

    payment.razorpay.paymentId = paymentId;
    payment.razorpay.signature = signature;
    await payment.updateStatus('success');

    return payment;
  }

  async cancelPayment(orderId) {
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.paymentStatus === 'success') {
      throw new ApiError(400, 'Cannot cancel a successful payment');
    }

    await payment.updateStatus('failed', { reason: 'Payment cancelled by user' });

    return payment;
  }
}

module.exports = new PaymentService();
