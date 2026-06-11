const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  
  res.status(200).json(new ApiResponse(200, user, 'User profile retrieved'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUser(req.user._id, req.body);
  
  res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }
  
  const user = await userService.getUserById(req.user._id);
  
  if (user.avatar) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await deleteFromCloudinary(`ecommerce/users/${publicId}`);
  }
  
  const result = await uploadToCloudinary(req.file.path, 'users');
  
  const updatedUser = await userService.updateUser(req.user._id, { avatar: result.url });
  
  res.status(200).json(new ApiResponse(200, { avatar: result.url }, 'Avatar updated successfully'));
});

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.getUserAddresses(req.user._id);
  
  res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved'));
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await userService.addAddress(req.user._id, req.body);
  
  res.status(201).json(new ApiResponse(201, address, 'Address added successfully'));
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await userService.updateAddress(req.params.addressId, req.body, req.user._id);
  
  res.status(200).json(new ApiResponse(200, address, 'Address updated successfully'));
});

const deleteAddress = asyncHandler(async (req, res) => {
  await userService.deleteAddress(req.params.addressId, req.user._id);
  
  res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await userService.setDefaultAddress(req.params.addressId, req.user._id);
  
  res.status(200).json(new ApiResponse(200, address, 'Default address set successfully'));
});

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await userService.getWishlist(req.user._id);
  
  res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist retrieved'));
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await userService.addToWishlist(req.user._id, productId);
  
  res.status(200).json(new ApiResponse(200, wishlist, 'Product added to wishlist'));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await userService.removeFromWishlist(req.user._id, productId);
  
  res.status(200).json(new ApiResponse(200, wishlist, 'Product removed from wishlist'));
});

const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const orders = await userService.getUserOrders(req.user._id, { page, limit, status });
  
  res.status(200).json(new ApiResponse(200, orders, 'Orders retrieved'));
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await userService.getOrderDetails(req.params.orderId, req.user._id);
  
  res.status(200).json(new ApiResponse(200, order, 'Order details retrieved'));
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats(req.user._id);
  
  res.status(200).json(new ApiResponse(200, stats, 'User stats retrieved'));
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getOrders,
  getOrderDetails,
  getStats
};