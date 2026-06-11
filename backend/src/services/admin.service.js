const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Category = require('../models/Category.model');
const Review = require('../models/Review.model');
const Payment = require('../models/Payment.model');
const Coupon = require('../models/Coupon.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const redisService = require('./redis.service');  
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class AdminService {
  async getDashboardStats() {
    const cacheKey = 'admin:dashboard:stats';
    const cachedStats = await redisService.get(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }
    
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      monthOrders,
      monthRevenue,
      pendingOrders,
      lowStockProducts,
      pendingReviews,
      activeCoupons
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ quantity: { $lt: 10 }, status: 'active' }),
      Review.countDocuments({ status: 'pending' }),
      Coupon.countDocuments({ isActive: true, status: 'active' })
    ]);
    
    const stats = {
      users: {
        total: totalUsers,
        newToday: await User.countDocuments({ createdAt: { $gte: startOfToday } }),
        newThisWeek: await User.countDocuments({ createdAt: { $gte: startOfWeek } }),
        newThisMonth: await User.countDocuments({ createdAt: { $gte: startOfMonth } })
      },
      products: {
        total: totalProducts,
        active: await Product.countDocuments({ status: 'active' }),
        inactive: await Product.countDocuments({ status: 'inactive' }),
        lowStock: lowStockProducts,
        outOfStock: await Product.countDocuments({ quantity: 0, status: 'active' })
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: await Order.countDocuments({ status: 'processing' }),
        shipped: await Order.countDocuments({ status: 'shipped' }),
        delivered: await Order.countDocuments({ status: 'delivered' }),
        cancelled: await Order.countDocuments({ status: 'cancelled' }),
        today: todayOrders,
        thisWeek: weekOrders,
        thisMonth: monthOrders
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        thisWeek: weekRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0,
        averageOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0
      },
      reviews: {
        pending: pendingReviews,
        approved: await Review.countDocuments({ status: 'approved' }),
        total: await Review.countDocuments(),
        averageRating: await this.getAverageRating()
      },
      coupons: {
        active: activeCoupons,
        total: await Coupon.countDocuments(),
        expired: await Coupon.countDocuments({ status: 'expired' })
      }
    };
    
    await redisService.set(cacheKey, stats, 300);
    
    return stats;
  }
  
  async getAverageRating() {
    const result = await Review.aggregate([
      { $match: { status: 'approved', isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    return result[0]?.avg || 0;
  }
  
  async getRevenueReport({ startDate, endDate, groupBy = 'day' }) {
    const match = {
      paymentStatus: 'paid',
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    let groupFormat;
    if (groupBy === 'day') {
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (groupBy === 'week') {
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
    } else {
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }
    
    const report = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    const totalRevenue = report.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = report.reduce((sum, item) => sum + item.orders, 0);
    
    return {
      startDate,
      endDate,
      groupBy,
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      data: report.map(item => ({
        period: item._id,
        revenue: item.revenue,
        orders: item.orders,
        averageOrderValue: item.averageOrderValue
      }))
    };
  }
  
  async getSalesReport({ startDate, endDate, category = null, product = null }) {
    const match = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'paid'
    };
    
    if (category) {
      const productsInCategory = await Product.find({ category }).select('_id');
      const productIds = productsInCategory.map(p => p._id);
      match['items.product'] = { $in: productIds };
    }
    
    if (product) {
      match['items.product'] = product;
    }
    
    const report = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          name: '$productInfo.name',
          sku: '$productInfo.sku',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    const totalRevenue = report.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalItems = report.reduce((sum, item) => sum + item.totalQuantity, 0);
    
    return {
      startDate,
      endDate,
      totalRevenue,
      totalItems,
      totalOrders: await Order.countDocuments(match),
      topProducts: report.slice(0, 10),
      fullReport: report
    };
  }
  
  async getTopProducts({ limit = 10, period = 'month' }) {
    let startDate;
    const now = new Date();
    
    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          name: '$product.name',
          price: '$product.price',
          images: '$product.images',
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
          revenuePerUnit: { $divide: ['$totalRevenue', '$totalSold'] }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);
    
    return topProducts;
  }
  
  async getTopCustomers({ limit = 10, period = 'year' }) {
    let startDate;
    const now = new Date();
    
    if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    const topCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orderCount: 1,
          averageOrderValue: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]);
    
    return topCustomers;
  }
  
  async getAllUsers({ page = 1, limit = 20, role = null, search = null, sort = '-createdAt' }) {
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);
    
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const stats = await this.getUserStats(user._id);
        return { ...user, stats };
      })
    );
    
    return {
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getUserStats(userId) {
    const [orderStats, reviewCount, paymentHistory] = await Promise.all([
      Order.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]),
      Review.countDocuments({ user: userId }),
      Payment.aggregate([
        { $match: { user: userId, paymentStatus: 'success' } },
        { $group: { _id: null, totalPayments: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);
    
    return {
      orders: orderStats[0] || { totalOrders: 0, totalSpent: 0, completedOrders: 0, cancelledOrders: 0 },
      reviews: reviewCount,
      payments: paymentHistory[0] || { totalPayments: 0, count: 0 }
    };
  }
  
  async updateUserRole(userId, role) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    await redisService.del(`admin:users:${userId}`);
    
    return user;
  }
  
  async suspendUser(userId, reason, days = 30) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    const lockUntil = new Date();
    lockUntil.setDate(lockUntil.getDate() + days);
    
    user.lockUntil = lockUntil;
    user.suspensionReason = reason;
    user.suspendedAt = new Date();
    await user.save();
    
    await redisService.del(`admin:users:${userId}`);
    
    return user;
  }
  
  async activateUser(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    user.lockUntil = undefined;
    user.suspensionReason = undefined;
    user.suspendedAt = undefined;
    user.loginAttempts = 0;
    await user.save();
    
    await redisService.del(`admin:users:${userId}`);
    
    return user;
  }
  
  async getAllOrders({ page = 1, limit = 20, status = null, paymentStatus = null, startDate = null, endDate = null }) {
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getAllProducts({ page = 1, limit = 20, status = null, category = null, lowStock = false }) {
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (lowStock) query.quantity = { $lt: 10 };
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
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
  
  async bulkUpdateProducts(productIds, updateData) {
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData },
      { runValidators: true }
    );
    
    for (const productId of productIds) {
      await redisService.del(`product:${productId}`);
    }
    await redisService.delPattern('products:*');
    
    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    };
  }
  
  async getSystemLogs({ level = 'info', limit = 100, startDate = null, endDate = null }) {
    const logFilePath = path.join(__dirname, '../../logs', `${level}.log`);
    
    if (!fs.existsSync(logFilePath)) {
      return { logs: [], message: 'Log file not found' };
    }
    
    const logs = fs.readFileSync(logFilePath, 'utf8');
    const logLines = logs.split('\n').filter(line => line.trim());
    
    let parsedLogs = logLines.map(line => {
      try {
        const match = line.match(/\[(.*?)\]\s+(.*?):\s+(.*)/);
        if (match) {
          return {
            timestamp: match[1],
            level: match[2],
            message: match[3],
            raw: line
          };
        }
        return { raw: line, timestamp: new Date(), message: line };
      } catch (error) {
        return { raw: line, timestamp: new Date(), message: line };
      }
    });
    
    if (startDate) {
      parsedLogs = parsedLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    if (endDate) {
      parsedLogs = parsedLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    parsedLogs = parsedLogs.slice(0, limit);
    
    return {
      logs: parsedLogs,
      count: parsedLogs.length,
      file: logFilePath
    };
  }
  
  async backupDatabase() {
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.gz`);
    
    const dbUri = process.env.MONGODB_URI;
    const dbName = dbUri.split('/').pop().split('?')[0];
    
    try {
      const command = `mongodump --uri="${dbUri}" --gzip --archive="${backupPath}"`;
      await execPromise(command);
      
      const stats = fs.statSync(backupPath);
      
      return {
        success: true,
        backupPath,
        size: stats.size,
        timestamp,
        dbName
      };
    } catch (error) {
      logger.error('Backup failed:', error);
      throw new ApiError(500, 'Database backup failed');
    }
  }
  
  async getCacheStats() {
    const client = await redisService.connect();
    const info = await client.info('stats');
    const memory = await client.info('memory');
    
    return {
      stats: info,
      memory,
      keys: await client.dbSize()
    };
  }
  
  async clearCache(pattern = '*') {
    await redisService.delPattern(pattern);
    return { success: true, pattern };
  }
  
  async getAnalytics({ type = 'overview', period = 'month' }) {
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    if (type === 'overview' || type === 'all') {
      const [revenue, orders, users, products] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        Product.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ])
      ]);
      
      return {
        period,
        startDate,
        endDate: new Date(),
        revenue,
        orders,
        users,
        products
      };
    }
    
    return { message: 'Analytics type not found' };
  }
  
  async getInventoryReport() {
    const categories = await Category.find();
    const report = [];
    
    for (const category of categories) {
      const products = await Product.find({ category: category._id });
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0);
      const outOfStock = products.filter(p => p.quantity === 0);
      
      report.push({
        category: category.name,
        totalProducts: products.length,
        totalValue,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStockProducts: lowStock.map(p => ({ name: p.name, quantity: p.quantity })),
        outOfStockProducts: outOfStock.map(p => p.name)
      });
    }
    
    return report;
  }
}

module.exports = new AdminService();