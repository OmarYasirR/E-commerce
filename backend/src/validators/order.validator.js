const { body, param, query } = require('express-validator');

const createOrderValidator = [
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required'),
  
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),
  
  body('shippingAddress.addressLine1')
    .trim()
    .notEmpty().withMessage('Address is required'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('shippingAddress.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty().withMessage('Postal code is required'),
  
  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Country is required'),
  
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  
  body('paymentMethod')
    .isIn(['stripe', 'razorpay', 'cod', 'paypal']).withMessage('Invalid payment method'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

const updateOrderStatusValidator = [
  body('status')
    .isIn(['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
];

const cancelOrderValidator = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
];

const orderIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID format')
];

const orderQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
];

module.exports = {
  createOrderValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  orderIdValidator,
  orderQueryValidator
};