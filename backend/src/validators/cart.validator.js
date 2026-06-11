const { body } = require('express-validator');

const addToCartValidator = [
  body('productId')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('variant')
    .optional()
    .isObject().withMessage('Variant must be an object')
];

const updateCartValidator = [
  body('productId')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  
  body('variant')
    .optional()
    .isObject()
];

const applyCouponValidator = [
  body('couponCode')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ max: 20 }).withMessage('Coupon code cannot exceed 20 characters')
];

const mergeCartValidator = [
  body('items')
    .isArray().withMessage('Items must be an array'),
  
  body('items.*.productId')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

module.exports = {
  addToCartValidator,
  updateCartValidator,
  applyCouponValidator,
  mergeCartValidator
};