const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const redisService = require('../services/redis.service');

// Helper to set no-cache headers
const setNoCacheHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
};

const getAllCategories = asyncHandler(async (req, res) => {
  const { includeProducts = false, status = 'active', _t } = req.query;
  
  setNoCacheHeaders(res);
  
  const categories = await categoryService.getAllCategories({ 
    includeProducts: includeProducts === 'true', 
    status 
  });
  return res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved'));
});

const getCategoryTree = asyncHandler(async (req, res) => {
  setNoCacheHeaders(res);
  
  const tree = await categoryService.getCategoryTree();
  return res.status(200).json(new ApiResponse(200, tree, 'Category tree retrieved'));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  setNoCacheHeaders(res);
  
  const category = await categoryService.getCategoryById(id);
  res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  setNoCacheHeaders(res);
  
  const category = await categoryService.getCategoryBySlug(slug);
  res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
});

const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;
  
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path, 'categories');
    categoryData.image = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  const category = await categoryService.createCategory(categoryData);
  
  // Clear all category-related caches
  await clearAllCategoryCaches();
  
  setNoCacheHeaders(res);
  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (updateData.name && updateData.name.trim() === '') {
    throw new ApiError(400, 'Category name cannot be empty');
  }
  
  if (req.file) {
    const category = await categoryService.getCategoryById(id);
    if (category.image && category.image.publicId) {
      await deleteFromCloudinary(category.image.publicId);
    }
    
    const result = await uploadToCloudinary(req.file.path, 'categories');
    updateData.image = {
      url: result.url,
      publicId: result.publicId
    };
  }
  
  const category = await categoryService.updateCategory(id, updateData);
  
  await clearAllCategoryCaches();
  
  setNoCacheHeaders(res);
  res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { moveProductsTo } = req.body;
  
  const category = await categoryService.getCategoryById(id);
  
  if (category.image && category.image.publicId) {
    await deleteFromCloudinary(category.image.publicId);
  }
  
  await categoryService.deleteCategory(id, moveProductsTo);
  
  await clearAllCategoryCaches();
  
  setNoCacheHeaders(res);
  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});

const getCategoryProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  setNoCacheHeaders(res);
  
  const products = await categoryService.getCategoryProducts(id, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort
  });
  
  res.status(200).json(new ApiResponse(200, products, 'Category products retrieved'));
});

const updateCategoryOrder = asyncHandler(async (req, res) => {
  const { orders } = req.body;
  
  const categories = await categoryService.updateCategoryOrder(orders);
  
  await clearAllCategoryCaches();
  
  setNoCacheHeaders(res);
  res.status(200).json(new ApiResponse(200, categories, 'Category order updated'));
});

// Helper function to clear all category caches
const clearAllCategoryCaches = async () => {
  try {
    await redisService.delPattern('categories:*');
    await redisService.delPattern('category:*');
    await redisService.del('category-tree');
  } catch (error) {
    console.error('Error clearing category caches:', error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  updateCategoryOrder,
  clearAllCategoryCaches
};