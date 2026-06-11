const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const couponController = require('../../controllers/coupon.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const createCouponValidation = [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('name').notEmpty().withMessage('Coupon name is required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  validate
];

const updateCouponValidation = [
  body('discountValue').optional().isFloat({ min: 0 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validate
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  validate
];

const validateCouponValidation = [
  body('cartTotal').optional().isFloat({ min: 0 }),
  validate
];

// Public routes
router.get('/active', couponController.getActiveCoupons);
router.get('/validate/:code', validateCouponValidation, couponController.validateCoupon);

// User routes
router.use(authenticate);
router.post('/apply/:code', couponController.applyCouponToCart);

// Admin routes
router.use(authorize('admin'));

router.get('/', couponController.getAllCoupons);
router.get('/:id', idValidation, couponController.getCouponById);
router.get('/code/:code', couponController.getCouponByCode);
router.get('/:id/stats', idValidation, couponController.getCouponStats);
router.post('/', createCouponValidation, couponController.createCoupon);
router.put('/:id', idValidation, updateCouponValidation, couponController.updateCoupon);
router.delete('/:id', idValidation, couponController.deleteCoupon);
router.post('/:id/toggle', idValidation, couponController.toggleCouponStatus);

module.exports = router;