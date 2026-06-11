const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const addToCartValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const updateCartValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
  validate  
];

const couponValidation = [
  body('couponCode').notEmpty().withMessage('Coupon code is required'),
  validate
];

router.use(authenticate);

router.get('/', cartController.getCart);
router.get('/summary', cartController.getCartSummary);
router.post('/add', addToCartValidation, cartController.addToCart);
router.put('/update', updateCartValidation, cartController.updateCartItem);
router.delete('/remove/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/coupon', couponValidation, cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);
router.post('/merge', cartController.mergeCart);

module.exports = router;