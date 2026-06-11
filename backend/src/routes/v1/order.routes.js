const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const createOrderValidation = [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('paymentMethod').isIn(['stripe', 'razorpay', 'cod']).withMessage('Invalid payment method'),
  validate
];

const cancelOrderValidation = [
  body('reason').optional().isString(),
  validate
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate
];

const statusValidation = [
  body('status').isIn(['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  validate
];

// User routes (all require authentication)
router.use(authenticate);

router.post('/', createOrderValidation, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', idValidation, orderController.getOrderById);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.post('/:id/cancel', idValidation, cancelOrderValidation, orderController.cancelOrder);
router.get('/:id/track', idValidation, orderController.trackOrder);
router.get('/:id/timeline', idValidation, orderController.getOrderTimeline);
router.post('/:id/return', idValidation, orderController.requestReturn);
router.get('/:id/invoice', idValidation, orderController.downloadInvoice);

// Admin routes
router.put('/:id/status', authorize('admin'), idValidation, statusValidation, orderController.updateOrderStatus);

module.exports = router;