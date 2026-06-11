const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cartService = require('../services/cart.service');
const couponService = require('../services/coupon.service');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  
  res.status(200).json(new ApiResponse(200, cart, 'Cart retrieved'));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant = null } = req.body;
  
  const cart = await cartService.addToCart(req.user._id, productId, quantity, variant);
  
  res.status(200).json(new ApiResponse(200, cart, 'Product added to cart'));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, variant = null } = req.body;
  
  const cart = await cartService.updateCartItem(req.user._id, productId, quantity, variant);
  
  res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, variant = null } = req.params;
  console.log(productId, variant) 
  
  const cart = await cartService.removeFromCart(req.user._id, productId, variant);
  
  res.status(200).json(new ApiResponse(200, cart, 'Product removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  
  res.status(200).json(new ApiResponse(200, cart, 'Cart cleared'));
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  
  const cart = await cartService.applyCoupon(req.user._id, couponCode);
  
  res.status(200).json(new ApiResponse(200, cart, 'Coupon applied successfully'));
});

const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCoupon(req.user._id);
  
  res.status(200).json(new ApiResponse(200, cart, 'Coupon removed'));
});

const getCartSummary = asyncHandler(async (req, res) => {
  const summary = await cartService.getCartSummary(req.user._id);
  
  res.status(200).json(new ApiResponse(200, summary, 'Cart summary retrieved'));
});

const mergeCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  const cart = await cartService.mergeCart(req.user._id, items);
  
  res.status(200).json(new ApiResponse(200, cart, 'Carts merged successfully'));
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartSummary,
  mergeCart
};