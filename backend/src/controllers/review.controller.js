const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const reviewService = require('../services/review.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');

const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, pros, cons } = req.body;
  
  const hasPurchased = await reviewService.checkUserPurchasedProduct(req.user._id, productId);
  
  if (!hasPurchased) {
    throw new ApiError(403, 'You can only review products you have purchased');
  }
  
  const existingReview = await reviewService.getUserProductReview(req.user._id, productId);
  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this product');
  }
  
  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, 'reviews');
      images.push({ url: result.url, publicId: result.publicId });
    }
  }
  
  const review = await reviewService.createReview({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    pros: pros ? JSON.parse(pros) : [],
    cons: cons ? JSON.parse(cons) : [],
    images,
    isVerifiedPurchase: hasPurchased
  });
  
  res.status(201).json(new ApiResponse(201, review, 'Review created successfully'));
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating, sort = '-createdAt' } = req.query;
  
  const reviews = await reviewService.getProductReviews(productId, {
    page: parseInt(page),
    limit: parseInt(limit),
    rating,
    sort
  });
  
  res.status(200).json(new ApiResponse(200, reviews, 'Product reviews retrieved'));
});

const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const review = await reviewService.getReviewById(id);
  
  res.status(200).json(new ApiResponse(200, review, 'Review retrieved'));
});

const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const review = await reviewService.updateReview(id, req.user._id, updateData);
  
  res.status(200).json(new ApiResponse(200, review, 'Review updated successfully'));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const review = await reviewService.getReviewById(id);
  
  for (const image of review.images) {
    await deleteFromCloudinary(image.publicId);
  }
  
  await reviewService.deleteReview(id, req.user._id, req.user.role);
  
  res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully'));
});

const markHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { helpful = true } = req.body;
  
  const review = await reviewService.markHelpful(id, req.user._id, helpful);
  
  res.status(200).json(new ApiResponse(200, review, 'Feedback recorded'));
});

const reportReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const review = await reviewService.reportReview(id, req.user._id, reason);
  
  res.status(200).json(new ApiResponse(200, review, 'Review reported successfully'));
});

const getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const reviews = await reviewService.getUserReviews(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(200).json(new ApiResponse(200, reviews, 'My reviews retrieved'));
});

const getReviewStats = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const stats = await reviewService.getProductReviewStats(productId);
  
  res.status(200).json(new ApiResponse(200, stats, 'Review stats retrieved'));
});

// Admin only controllers
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, rating } = req.query;
  
  const reviews = await reviewService.getAllReviews({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    rating: rating ? parseInt(rating) : null
  });
  
  res.status(200).json(new ApiResponse(200, reviews, 'All reviews retrieved'));
});

const approveReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const review = await reviewService.approveReview(id, req.user._id);
  
  res.status(200).json(new ApiResponse(200, review, 'Review approved successfully'));
});

const rejectReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const review = await reviewService.rejectReview(id, req.user._id, reason);
  
  res.status(200).json(new ApiResponse(200, review, 'Review rejected successfully'));
});

module.exports = {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  getMyReviews,
  getReviewStats,
  getAllReviews,
  approveReview,
  rejectReview
};