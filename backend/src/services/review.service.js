const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const redisService = require('./redis.service');

class ReviewService {
  async createReview(reviewData) {
    const { product, user, rating, title, comment, pros, cons, images, isVerifiedPurchase } = reviewData;
    
    const productExists = await Product.findById(product);
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }
    
    const review = new Review({
      product,
      user,
      rating,
      title,
      comment,
      pros: pros || [],
      cons: cons || [],
      images: images || [],
      isVerifiedPurchase: isVerifiedPurchase || false,
      isApproved: false,
      status: 'pending'
    });
    
    await review.save();
    
    await redisService.del(`product:${product}`);
    await redisService.delPattern(`reviews:product:${product}:*`);
    
    return review;
  }
  
  async getProductReviews(productId, { page = 1, limit = 10, rating = null, sort = '-createdAt' }) {
    const query = { 
      product: productId, 
      isApproved: true, 
      status: 'approved' 
    };
    
    if (rating) {
      query.rating = rating;
    }
    
    const skip = (page - 1) * limit;
    
    const cacheKey = `reviews:product:${productId}:page:${page}:limit:${limit}:rating:${rating}:sort:${sort}`;
    const cachedData = await redisService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ]);
    
    const result = {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary: await this.getProductReviewStats(productId)
    };
    
    await redisService.set(cacheKey, result, 300);
    
    return result;
  }
  
  async getReviewById(reviewId) {
    const review = await Review.findById(reviewId)
      .populate('user', 'name avatar')
      .populate('product', 'name slug price images');
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    return review;
  }
  
  async getUserProductReview(userId, productId) {
    const review = await Review.findOne({
      user: userId,
      product: productId
    });
    
    return review;
  }
  
  async updateReview(reviewId, userId, updateData) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new ApiError(404, 'Review not found or you do not have permission');
    }
    
    const allowedUpdates = ['rating', 'title', 'comment', 'pros', 'cons'];
    const filteredData = {};
    
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }
    
    Object.assign(review, filteredData);
    
    if (review.isApproved) {
      review.isApproved = false;
      review.status = 'pending';
    }
    
    await review.save();
    
    await Review.updateProductRating(review.product);
    
    await redisService.del(`product:${review.product}`);
    await redisService.delPattern(`reviews:product:${review.product}:*`);
    await redisService.del(`review:${reviewId}`);
    
    return review;
  }
  
  async deleteReview(reviewId, userId, userRole = 'user') {
    const query = userRole === 'admin' 
      ? { _id: reviewId }
      : { _id: reviewId, user: userId };
    
    const review = await Review.findOne(query);
    
    if (!review) {
      throw new ApiError(404, 'Review not found or you do not have permission');
    }
    
    await review.remove();
    
    await Review.updateProductRating(review.product);
    
    await redisService.del(`product:${review.product}`);
    await redisService.delPattern(`reviews:product:${review.product}:*`);
    
    return true;
  }
  
  async markHelpful(reviewId, userId, isHelpful = true) {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    await review.markHelpful(userId, isHelpful);
    
    await redisService.del(`review:${reviewId}`);
    await redisService.delPattern(`reviews:product:${review.product}:*`);
    
    return review;
  }
  
  async reportReview(reviewId, userId, reason) {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    await review.report(userId, reason);
    
    await redisService.del(`review:${reviewId}`);
    
    return review;
  }
  
  async getUserReviews(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate('product', 'name slug price images')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ user: userId })
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
  
  async getProductReviewStats(productId) {
    const cacheKey = `reviews:stats:${productId}`;
    const cachedStats = await redisService.get(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }
    
    const stats = await Review.aggregate([
      { $match: { product: productId, isApproved: true, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0
    };
    
    const percentage = (count) => result.totalReviews > 0 
      ? (count / result.totalReviews) * 100 
      : 0;
    
    const formattedResult = {
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      distribution: [
        { rating: 5, count: result.rating5, percentage: percentage(result.rating5) },
        { rating: 4, count: result.rating4, percentage: percentage(result.rating4) },
        { rating: 3, count: result.rating3, percentage: percentage(result.rating3) },
        { rating: 2, count: result.rating2, percentage: percentage(result.rating2) },
        { rating: 1, count: result.rating1, percentage: percentage(result.rating1) }
      ]
    };
    
    await redisService.set(cacheKey, formattedResult, 1800);
    
    return formattedResult;
  }
  
  async checkUserPurchasedProduct(userId, productId) {
    const order = await Order.findOne({
      user: userId,
      'items.product': productId,
      status: 'delivered'
    });
    
    return !!order;
  }
  
  // Admin only methods
  async getAllReviews({ page = 1, limit = 20, status = null, rating = null, sort = '-createdAt' }) {
    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = rating;
    
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('product', 'name slug price')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
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
  
  async approveReview(reviewId, adminId) {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    await review.approve(adminId);
    
    await redisService.del(`review:${reviewId}`);
    await redisService.del(`product:${review.product}`);
    await redisService.delPattern(`reviews:product:${review.product}:*`);
    await redisService.del(`reviews:stats:${review.product}`);
    
    return review;
  }
  
  async rejectReview(reviewId, adminId, reason) {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    await review.reject(adminId, reason);
    
    await redisService.del(`review:${reviewId}`);
    await redisService.del(`product:${review.product}`);
    await redisService.delPattern(`reviews:product:${review.product}:*`);
    
    return review;
  }
  
  async bulkApproveReviews(reviewIds, adminId) {
    const results = {
      approved: [],
      failed: []
    };
    
    for (const reviewId of reviewIds) {
      try {
        const review = await this.approveReview(reviewId, adminId);
        results.approved.push({
          id: reviewId,
          product: review.product
        });
      } catch (error) {
        results.failed.push({
          id: reviewId,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  async bulkDeleteReviews(reviewIds, adminId) {
    const results = {
      deleted: [],
      failed: []
    };
    
    for (const reviewId of reviewIds) {
      try {
        const review = await Review.findById(reviewId);
        if (review) {
          const productId = review.product;
          await review.remove();
          await Review.updateProductRating(productId);
          results.deleted.push(reviewId);
          
          await redisService.del(`product:${productId}`);
          await redisService.delPattern(`reviews:product:${productId}:*`);
          await redisService.del(`reviews:stats:${productId}`);
        }
      } catch (error) {
        results.failed.push({
          id: reviewId,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  async getReportedReviews({ page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find({ 'reported.count': { $gt: 0 } })
        .populate('user', 'name email')
        .populate('product', 'name slug')
        .sort('-reported.count')
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ 'reported.count': { $gt: 0 } })
    ]);
    
    return {
      reviews: reviews.map(review => ({
        ...review,
        reportCount: review.reported.count,
        reports: review.reported.users
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getReviewAnalytics(startDate, endDate) {
    const query = {};
    if (startDate) query.createdAt = { $gte: startDate };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: endDate };
    
    const analytics = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    const totalReviews = await Review.countDocuments(query);
    const approvedReviews = await Review.countDocuments({ ...query, status: 'approved' });
    const pendingReviews = await Review.countDocuments({ ...query, status: 'pending' });
    const rejectedReviews = await Review.countDocuments({ ...query, status: 'rejected' });
    const reportedReviews = await Review.countDocuments({ ...query, 'reported.count': { $gt: 0 } });
    
    const averageRating = await Review.aggregate([
      { $match: { ...query, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    return {
      summary: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        rejectedReviews,
        reportedReviews,
        averageRating: averageRating[0]?.avg || 0,
        approvalRate: totalReviews > 0 ? (approvedReviews / totalReviews) * 100 : 0
      },
      timeline: analytics
    };
  }
  
  async addReviewImages(reviewId, userId, images) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    review.images.push(...images);
    await review.save();
    
    return review;
  }
  
  async deleteReviewImage(reviewId, userId, imageId) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    const image = review.images.id(imageId);
    if (!image) {
      throw new ApiError(404, 'Image not found');
    }
    
    image.remove();
    await review.save();
    
    return review;
  }
  
  async getHelpfulReviews(productId, limit = 5) {
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
      status: 'approved'
    })
      .sort('-helpful.count')
      .limit(limit)
      .populate('user', 'name avatar')
      .lean();
    
    return reviews;
  }
  
  async getRecentReviews(productId, limit = 5) {
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
      status: 'approved'
    })
      .sort('-createdAt')
      .limit(limit)
      .populate('user', 'name avatar')
      .lean();
    
    return reviews;
  }
}

module.exports = new ReviewService();