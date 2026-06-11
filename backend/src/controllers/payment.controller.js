// backend/src/controllers/payment.controller.js
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod = 'stripe' } = req.body;
  
  // Validate orderId
  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }
  
  // Get order details
  const order = await orderService.getOrderById(orderId, req.user._id, req.user.role);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  // Check if order is already paid
  if (order.paymentStatus === 'paid') {
    throw new ApiError(400, 'Order already paid')
  }
  
  const paymentIntent = await paymentService.createPaymentIntent(order, paymentMethod);
  
  res.status(200).json(new ApiResponse(200, paymentIntent, 'Payment intent created'));
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, paymentMethodId } = req.body;
  
  if (!paymentIntentId) {
    throw new ApiError(400, 'Payment intent ID is required')
  }
  
  const payment = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);
  
  res.status(200).json(new ApiResponse(200, payment, 'Payment confirmed'));
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const payment = await paymentService.getPaymentByOrder(orderId, req.user._id);
  
  res.status(200).json(new ApiResponse(200, payment, 'Payment status retrieved'));
});

const processRefund = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { amount, reason } = req.body;
  
  const refund = await paymentService.processRefund(orderId, amount, reason, req.user._id);
  
  res.status(200).json(new ApiResponse(200, refund, 'Refund processed successfully'));
});

const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await paymentService.getAvailablePaymentMethods();
  
  res.status(200).json(new ApiResponse(200, methods, 'Payment methods retrieved'));
});

const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  await paymentService.handleStripeWebhook(req.body, sig);
  
  res.status(200).json({ received: true });
});

const razorpayWebhook = asyncHandler(async (req, res) => {
  await paymentService.handleRazorpayWebhook(req.body);
  
  res.status(200).json({ received: true });
});

const getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const history = await paymentService.getPaymentHistory(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(200).json(new ApiResponse(200, history, 'Payment history retrieved'));
});

const initiateCOD = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  
  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }
  
  const order = await orderService.getOrderById(orderId, req.user._id, req.user.role);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  const payment = await paymentService.initiateCOD(order);
  
  res.status(200).json(new ApiResponse(200, payment, 'COD payment initiated'));
});

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  getPaymentMethods,
  stripeWebhook,
  razorpayWebhook,
  getPaymentHistory,
  initiateCOD
};