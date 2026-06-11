const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const productService = require('../services/product.service');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const redisService = require('../services/redis.service');

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    rating,
    search,
    tag,
    status = 'active'
  } = req.query;
  
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  const cachedData = await redisService.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json(new ApiResponse(200, cachedData, 'Products retrieved (cached)'));
  }
  
  const products = await productService.getAllProducts({
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    filters: { category, minPrice, maxPrice, rating, search, tag, status }
  });
  
  await redisService.set(cacheKey, products, 300);
  
  res.status(200).json(new ApiResponse(200, products, 'Products retrieved'));
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const cacheKey = `product:${id}`;
  const cachedProduct = await redisService.get(cacheKey);
  
  if (cachedProduct) {
    return res.status(200).json(new ApiResponse(200, cachedProduct, 'Product retrieved (cached)'));
  }
  
  const product = await productService.getProductById(id);
  
  await redisService.set(cacheKey, product, 600);
  
  await productService.incrementViewCount(id);
  
  res.status(200).json(new ApiResponse(200, product, 'Product retrieved'));
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const product = await productService.getProductBySlug(slug);
  
  res.status(200).json(new ApiResponse(200, product, 'Product retrieved'));
});

const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, 'products');
      images.push({
        url: result.url,
        publicId: result.publicId,
        isMain: images.length === 0
      });
    }
    productData.images = images;
  }
  
  const product = await productService.createProduct(productData, req.user._id);
  
  await redisService.delPattern('products:*');
  
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const product = await productService.updateProduct(id, updateData);
  
  await redisService.del(`product:${id}`);
  await redisService.delPattern('products:*');
  
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const product = await productService.getProductById(id);
  
  for (const image of product.images) {
    await deleteFromCloudinary(image.publicId);
  }
  
  await productService.deleteProduct(id);
  
  await redisService.del(`product:${id}`);
  await redisService.delPattern('products:*');
  
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded');
  }
  
  const images = [];
  for (const file of req.files) {
    const result = await uploadToCloudinary(file.path, 'products');
    images.push({
      url: result.url,
      publicId: result.publicId,
      isMain: false
    });
  }
  
  const product = await productService.addProductImages(id, images);
  
  await redisService.del(`product:${id}`);
  
  res.status(200).json(new ApiResponse(200, product, 'Images uploaded successfully'));
});

const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  
  const product = await productService.getProductById(id);
  const image = product.images.id(imageId);
  
  if (!image) {
    throw new ApiError(404, 'Image not found');
  }
  
  await deleteFromCloudinary(image.publicId);
  
  const updatedProduct = await productService.deleteProductImage(id, imageId);
  
  await redisService.del(`product:${id}`);
  
  res.status(200).json(new ApiResponse(200, updatedProduct, 'Image deleted successfully'));
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const reviews = await productService.getProductReviews(id, { page: parseInt(page), limit: parseInt(limit) });
  
  res.status(200).json(new ApiResponse(200, reviews, 'Product reviews retrieved'));
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;
  
  const products = await productService.getRelatedProducts(id, parseInt(limit));
  
  res.status(200).json(new ApiResponse(200, products, 'Related products retrieved'));
});

const getProductStats = asyncHandler(async (req, res) => {
  const stats = await productService.getProductStats();
  
  res.status(200).json(new ApiResponse(200, stats, 'Product stats retrieved'));
});

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getProductReviews,
  getRelatedProducts,
  getProductStats
};