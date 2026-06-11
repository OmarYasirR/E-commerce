const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const Review = require('../models/Review.model');
const ApiError = require('../utils/ApiError');

class ProductService {
  async getAllProducts({ page = 1, limit = 10, sort = '-createdAt', filters = {} }) {
    const query = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }
    if (filters.rating) {
      query['ratings.average'] = { $gte: parseFloat(filters.rating) };
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.tag) {
      query.tags = filters.tag;
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getProductById(productId) {
    const product = await Product.findById(productId)
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        match: { isApproved: true, status: 'approved' },
        options: { limit: 5, sort: '-createdAt' },
        populate: { path: 'user', select: 'name avatar' }
      });
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    return product;
  }
  
  async getProductBySlug(slug) {
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug');
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    return product;
  }
  
  async createProduct(productData, userId) {
    if (productData.category) {
      const category = await Category.findById(productData.category);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
    }
    
    const product = new Product(productData);
    await product.save();
    
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: 1 }
    });
    
    return product;
  }
  
  async updateProduct(productId, updateData) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    if (updateData.category && updateData.category !== product.category.toString()) {
      await Category.findByIdAndUpdate(product.category, {
        $inc: { productCount: -1 }
      });
      await Category.findByIdAndUpdate(updateData.category, {
        $inc: { productCount: 1 }
      });
    }
    
    Object.assign(product, updateData);
    await product.save();
    
    return product;
  }
  
  async deleteProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });
    
    await product.remove();
    
    return true;
  }
  
  async addProductImages(productId, images) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    product.images.push(...images);
    await product.save();
    
    return product;
  }
  
  async deleteProductImage(productId, imageId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    product.images.id(imageId).remove();
    await product.save();
    
    return product;
  }
  
  async getProductReviews(productId, { page = 1, limit = 10, rating = null, sort = '-createdAt' }) {
    const query = { product: productId, isApproved: true, status: 'approved' };
    if (rating) query.rating = rating;
    
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getRelatedProducts(productId, limit = 4) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    const related = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      status: 'active'
    })
      .limit(limit)
      .select('name price images ratings slug');
    
    return related;
  }
  
  async incrementViewCount(productId) {
    await Product.findByIdAndUpdate(productId, {
      $inc: { viewCount: 1 }
    });
  }
  
  async getProductStats() {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' },
          totalViews: { $sum: '$viewCount' },
          totalSold: { $sum: '$soldQuantity' }
        }
      }
    ]);
    
    return stats[0] || {
      totalProducts: 0,
      totalValue: 0,
      avgPrice: 0,
      totalViews: 0,
      totalSold: 0
    };
  }
}

module.exports = new ProductService();