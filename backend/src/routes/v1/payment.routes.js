const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const createIntentValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  body('paymentMethod')
    .optional()
    .isIn(['stripe', 'razorpay', 'cod'])
    .withMessage('Invalid payment method'),
  validate
];

const confirmPaymentValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('paymentMethodId')
    .optional(),
  validate
];

const refundValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('reason')
    .optional()
    .isString(),
  validate
];

const idValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  validate
];

const initiateCODValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  validate
];

// Webhooks (no auth)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
router.post('/webhooks/razorpay', paymentController.razorpayWebhook);

// User routes
router.use(authenticate);

router.post('/create-intent', createIntentValidation, paymentController.createPaymentIntent);
router.post('/confirm', confirmPaymentValidation, paymentController.confirmPayment);
router.get('/methods', paymentController.getPaymentMethods);
router.get('/history', paymentController.getPaymentHistory);
router.get('/status/:orderId', idValidation, paymentController.getPaymentStatus);
router.post('/initiate-cod', initiateCODValidation, paymentController.initiateCOD);

// Admin routes
router.post('/refund/:orderId', authorize('admin'), refundValidation, paymentController.processRefund);

module.exports = router;