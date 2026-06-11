const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const couponService = require('../services/coupon.service');

const getAllCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, isActive } = req.query;
  
  const coupons = await couponService.getAllCoupons({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    isActive: isActive === 'true'
  });
  
  res.status(200).json(new ApiResponse(200, coupons, 'Coupons retrieved'));
});

const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const coupon = await couponService.getCouponById(id);
  
  res.status(200).json(new ApiResponse(200, coupon, 'Coupon retrieved'));
});

const getCouponByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  const coupon = await couponService.getCouponByCode(code);
  
  res.status(200).json(new ApiResponse(200, coupon, 'Coupon retrieved'));
});

const createCoupon = asyncHandler(async (req, res) => {
  const couponData = req.body;
  
  const existingCoupon = await couponService.getCouponByCode(couponData.code);
  if (existingCoupon) {
    throw new ApiError(400, 'Coupon code already exists');
  }
  
  const coupon = await couponService.createCoupon(couponData, req.user._id);
  
  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const coupon = await couponService.updateCoupon(id, updateData);
  
  res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await couponService.deleteCoupon(id);
  
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { cartTotal } = req.body;
  
  const validation = await couponService.validateCoupon(code, req.user._id, cartTotal);
  
  res.status(200).json(new ApiResponse(200, validation, 'Coupon validation result'));
});

const applyCouponToCart = asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  const result = await couponService.applyCouponToCart(code, req.user._id);
  
  res.status(200).json(new ApiResponse(200, result, 'Coupon applied to cart'));
});

const getCouponStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const stats = await couponService.getCouponStats(id);
  
  res.status(200).json(new ApiResponse(200, stats, 'Coupon stats retrieved'));
});

const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getActiveCoupons();
  
  res.status(200).json(new ApiResponse(200, coupons, 'Active coupons retrieved'));
});

const toggleCouponStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const coupon = await couponService.toggleCouponStatus(id);
  
  res.status(200).json(new ApiResponse(200, coupon, 'Coupon status toggled'));
});

module.exports = {
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCouponToCart,
  getCouponStats,
  getActiveCoupons,
  toggleCouponStatus
};