const Coupon = require('../models/Coupon.model');
const Cart = require('../models/Cart.model');
const Order = require('../models/Order.model');
const ApiError = require('../utils/ApiError');
const redisService = require('./redis.service');

class CouponService {
  async getAllCoupons({ page = 1, limit = 10, status = null, isActive = null } = {}) {
    const query = {};
    if (status) query.status = status;
    if (isActive !== null) query.isActive = isActive;
    
    const skip = (page - 1) * limit;
    
    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Coupon.countDocuments(query)
    ]);
    
    return {
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getCouponById(couponId) {
    const coupon = await Coupon.findById(couponId)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .populate('excludedProducts', 'name price')
      .populate('excludedCategories', 'name');
    
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    return coupon;
  }
  
  async getCouponByCode(code) {
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });
    
    return coupon;
  }
  
  async createCoupon(couponData, userId) {
    couponData.code = couponData.code.toUpperCase();
    
    const existingCoupon = await Coupon.findOne({ code: couponData.code });
    if (existingCoupon) {
      throw new ApiError(400, 'Coupon code already exists');
    }
    
    if (new Date(couponData.startDate) >= new Date(couponData.endDate)) {
      throw new ApiError(400, 'End date must be after start date');
    }
    
    const coupon = new Coupon({
      ...couponData,
      createdBy: userId
    });
    
    await coupon.save();
    
    await redisService.delPattern('coupons:*');
    
    return coupon;
  }
  
  async updateCoupon(couponId, updateData) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code, 
        _id: { $ne: couponId } 
      });
      if (existingCoupon) {
        throw new ApiError(400, 'Coupon code already exists');
      }
    }
    
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        throw new ApiError(400, 'End date must be after start date');
      }
    } else if (updateData.startDate) {
      if (new Date(updateData.startDate) >= coupon.endDate) {
        throw new ApiError(400, 'Start date must be before end date');
      }
    } else if (updateData.endDate) {
      if (coupon.startDate >= new Date(updateData.endDate)) {
        throw new ApiError(400, 'End date must be after start date');
      }
    }
    
    Object.assign(coupon, updateData);
    await coupon.save();
    
    await redisService.delPattern('coupons:*');
    await redisService.del(`coupon:${coupon.code}`);
    
    return coupon;
  }
  
  async deleteCoupon(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    await coupon.remove();
    
    await redisService.delPattern('coupons:*');
    await redisService.del(`coupon:${coupon.code}`);
    
    return true;
  }
  
  async validateCoupon(code, userId, cartTotal = 0) {
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });
    
    if (!coupon) {
      return { valid: false, reason: 'Invalid coupon code' };
    }
    
    const validation = await coupon.isValid(userId, cartTotal);
    
    if (!validation.valid) {
      return validation;
    }
    
    const discount = coupon.calculateDiscount(cartTotal);
    
    return {
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        freeShipping: coupon.freeShipping
      }
    };
  }
  
  async applyCouponToCart(code, userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }
    
    const validation = await this.validateCoupon(code, userId, cart.subtotal);
    
    if (!validation.valid) {
      throw new ApiError(400, validation.reason);
    }
    
    cart.discount = validation.coupon.discountAmount;
    cart.couponCode = code.toUpperCase();
    cart.total = cart.subtotal - cart.discount;
    
    await cart.save();
    
    await redisService.del(`cart:${userId}`);
    
    return {
      cart,
      discount: validation.coupon.discountAmount,
      couponCode: code.toUpperCase()
    };
  }
  
  async getCouponStats(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    const ordersUsingCoupon = await Order.find({
      'coupon.code': coupon.code
    }).select('totalAmount status createdAt');
    
    const totalUsed = ordersUsingCoupon.length;
    const totalDiscountAmount = ordersUsingCoupon.reduce(
      (sum, order) => sum + (order.discount || 0), 
      0
    );
    const completedOrders = ordersUsingCoupon.filter(
      order => order.status === 'delivered'
    ).length;
    
    return {
      couponCode: coupon.code,
      name: coupon.name,
      totalUsed,
      totalDiscountAmount,
      completedOrders,
      usageRate: totalUsed > 0 ? (completedOrders / totalUsed) * 100 : 0,
      remainingUsage: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : null,
      uniqueUsers: coupon.usersUsed.length,
      orders: ordersUsingCoupon.map(order => ({
        orderId: order._id,
        amount: order.totalAmount,
        discount: order.discount,
        status: order.status,
        date: order.createdAt
      }))
    };
  }
  
  async getActiveCoupons() {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).select('code name discountType discountValue minimumOrderAmount freeShipping');
    
    return coupons;
  }
  
  async toggleCouponStatus(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    coupon.isActive = !coupon.isActive;
    coupon.status = coupon.isActive ? 'active' : 'disabled';
    await coupon.save();
    
    await redisService.delPattern('coupons:*');
    await redisService.del(`coupon:${coupon.code}`);
    
    return coupon;
  }
  
  async bulkCreateCoupons(couponsData, userId) {
    const results = {
      successful: [],
      failed: []
    };
    
    for (const couponData of couponsData) {
      try {
        couponData.code = couponData.code.toUpperCase();
        
        const existingCoupon = await Coupon.findOne({ code: couponData.code });
        if (existingCoupon) {
          results.failed.push({
            code: couponData.code,
            error: 'Coupon code already exists'
          });
          continue;
        }
        
        const coupon = new Coupon({
          ...couponData,
          createdBy: userId
        });
        
        await coupon.save();
        results.successful.push(coupon);
      } catch (error) {
        results.failed.push({
          code: couponData.code,
          error: error.message
        });
      }
    }
    
    await redisService.delPattern('coupons:*');
    
    return results;
  }
  
  async getUserCouponUsage(userId) {
    const coupons = await Coupon.find({
      'usersUsed.user': userId
    }).select('code name discountType discountValue usersUsed');
    
    return coupons.map(coupon => {
      const userUsage = coupon.usersUsed.find(
        u => u.user.toString() === userId.toString()
      );
      return {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        timesUsed: userUsage?.usedCount || 0,
        lastUsed: userUsage?.usedAt,
        maxUses: coupon.perUserLimit
              };
    });
  }

  async getExpiringCoupons(daysThreshold = 7) {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    
    const coupons = await Coupon.find({
      isActive: true,
      status: 'active',
      endDate: { $gte: now, $lte: threshold }
    }).select('code name endDate discountType discountValue');
    
    return coupons;
  }

  async duplicateCoupon(couponId, newCode) {
    const originalCoupon = await Coupon.findById(couponId);
    if (!originalCoupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    const existingCoupon = await Coupon.findOne({ code: newCode.toUpperCase() });
    if (existingCoupon) {
      throw new ApiError(400, 'Coupon code already exists');
    }
    
    const couponData = originalCoupon.toObject();
    delete couponData._id;
    delete couponData.createdAt;
    delete couponData.updatedAt;
    delete couponData.usageCount;
    delete couponData.usersUsed;
    
    couponData.code = newCode.toUpperCase();
    couponData.name = `${couponData.name} (Copy)`;
    couponData.usageCount = 0;
    couponData.usersUsed = [];
    
    const newCoupon = new Coupon(couponData);
    await newCoupon.save();
    
    await redisService.delPattern('coupons:*');
    
    return newCoupon;
  }

  async getApplicableCoupons(userId, cartTotal, products = []) {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { usageCount: { $lt: '$usageLimit' } }
      ]
    });
    
    const applicableCoupons = [];
    
    for (const coupon of coupons) {
      const validation = await coupon.isValid(userId, cartTotal);
      
      if (!validation.valid) {
        continue;
      }
      
      let isApplicableToProducts = true;
      
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const productIds = products.map(p => p.toString());
        const hasApplicableProduct = coupon.applicableProducts.some(
          pid => productIds.includes(pid.toString())
        );
        if (!hasApplicableProduct) {
          isApplicableToProducts = false;
        }
      }
      
      if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
        const productIds = products.map(p => p.toString());
        const hasExcludedProduct = coupon.excludedProducts.some(
          pid => productIds.includes(pid.toString())
        );
        if (hasExcludedProduct) {
          isApplicableToProducts = false;
        }
      }
      
      if (isApplicableToProducts) {
        const discount = coupon.calculateDiscount(cartTotal);
        applicableCoupons.push({
          id: coupon._id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discount,
          minimumOrderAmount: coupon.minimumOrderAmount,
          freeShipping: coupon.freeShipping,
          savings: discount + (coupon.freeShipping ? ' + Free Shipping' : '')
        });
      }
    }
    
    applicableCoupons.sort((a, b) => b.discountAmount - a.discountAmount);
    
    return applicableCoupons;
  }

  async validateCouponForOrder(code, userId, orderTotal, products = []) {
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });
    
    if (!coupon) {
      return { valid: false, reason: 'Invalid coupon code' };
    }
    
    const validation = await coupon.isValid(userId, orderTotal);
    
    if (!validation.valid) {
      return validation;
    }
    
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const productIds = products.map(p => p.toString());
      const hasApplicableProduct = coupon.applicableProducts.some(
        pid => productIds.includes(pid.toString())
      );
      if (!hasApplicableProduct) {
        return { valid: false, reason: 'Coupon not applicable to items in your cart' };
      }
    }
    
    if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
      const productIds = products.map(p => p.toString());
      const hasExcludedProduct = coupon.excludedProducts.some(
        pid => productIds.includes(pid.toString())
      );
      if (hasExcludedProduct) {
        return { valid: false, reason: 'Coupon not applicable due to excluded items' };
      }
    }
    
    const discount = coupon.calculateDiscount(orderTotal);
    
    return {
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        freeShipping: coupon.freeShipping
      }
    };
  }

  async markCouponAsUsed(code, userId, orderId) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    await coupon.markAsUsed(userId, orderId);
    
    await redisService.delPattern('coupons:*');
    await redisService.del(`coupon:${coupon.code}`);
    
    return coupon;
  }

  async getCouponReport(startDate, endDate) {
    const query = {};
    if (startDate) query.createdAt = { $gte: startDate };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: endDate };
    
    const coupons = await Coupon.find(query);
    
    const report = {
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isActive && c.status === 'active').length,
      expiredCoupons: coupons.filter(c => c.status === 'expired').length,
      disabledCoupons: coupons.filter(c => c.status === 'disabled').length,
      totalUsageCount: coupons.reduce((sum, c) => sum + c.usageCount, 0),
      totalDiscountGiven: 0,
      couponsByType: {
        percentage: 0,
        fixed: 0
      },
      topCoupons: []
    };
    
    for (const coupon of coupons) {
      if (coupon.discountType === 'percentage') {
        report.couponsByType.percentage++;
      } else {
        report.couponsByType.fixed++;
      }
      
      const orders = await Order.find({ 'coupon.code': coupon.code });
      const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
      report.totalDiscountGiven += totalDiscount;
      
      report.topCoupons.push({
        code: coupon.code,
        name: coupon.name,
        usageCount: coupon.usageCount,
        totalDiscount: totalDiscount
      });
    }
    
    report.topCoupons.sort((a, b) => b.usageCount - a.usageCount);
    report.topCoupons = report.topCoupons.slice(0, 10);
    
    return report;
  }

  async cleanupExpiredCoupons() {
    const now = new Date();
    const result = await Coupon.updateMany(
      {
        endDate: { $lt: now },
        status: 'active'
      },
      {
        status: 'expired',
        isActive: false
      }
    );
    
    if (result.modifiedCount > 0) {
      await redisService.delPattern('coupons:*');
    }
    
    return {
      expiredCount: result.modifiedCount
    };
  }

  async getCouponValueAnalysis() {
    const coupons = await Coupon.find({ isActive: true });
    
    const analysis = {
      averageDiscountValue: 0,
      maxDiscountValue: 0,
      minDiscountValue: 0,
      percentageCoupons: [],
      fixedCoupons: []
    };
    
    let totalDiscountValue = 0;
    
    for (const coupon of coupons) {
      totalDiscountValue += coupon.discountValue;
      
      if (coupon.discountValue > analysis.maxDiscountValue) {
        analysis.maxDiscountValue = coupon.discountValue;
      }
      
      if (analysis.minDiscountValue === 0 || coupon.discountValue < analysis.minDiscountValue) {
        analysis.minDiscountValue = coupon.discountValue;
      }
      
      if (coupon.discountType === 'percentage') {
        analysis.percentageCoupons.push({
          code: coupon.code,
          value: coupon.discountValue,
          maxDiscount: coupon.maximumDiscountAmount
        });
      } else {
        analysis.fixedCoupons.push({
          code: coupon.code,
          value: coupon.discountValue
        });
      }
    }
    
    analysis.averageDiscountValue = coupons.length > 0 ? totalDiscountValue / coupons.length : 0;
    
    return analysis;
  }

  async importCoupons(couponsData, userId) {
    const results = {
      imported: [],
      skipped: [],
      errors: []
    };
    
    for (const couponData of couponsData) {
      try {
        const existingCoupon = await Coupon.findOne({ 
          code: couponData.code.toUpperCase() 
        });
        
        if (existingCoupon) {
          results.skipped.push({
            code: couponData.code,
            reason: 'Coupon code already exists'
          });
          continue;
        }
        
        const coupon = new Coupon({
          ...couponData,
          code: couponData.code.toUpperCase(),
          createdBy: userId
        });
        
        await coupon.save();
        results.imported.push(coupon);
      } catch (error) {
        results.errors.push({
          code: couponData.code,
          error: error.message
        });
      }
    }
    
    await redisService.delPattern('coupons:*');
    
    return results;
  }

  async exportCoupons(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.discountType) query.discountType = filters.discountType;
    if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
    if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
    
    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .lean();
    
    return coupons.map(coupon => ({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      freeShipping: coupon.freeShipping,
      status: coupon.status,
      usageCount: coupon.usageCount,
      createdBy: coupon.createdBy?.email,
      createdAt: coupon.createdAt
    }));
  }

  async validateBulkCoupons(couponCodes, userId, cartTotal) {
    const results = [];
    
    for (const code of couponCodes) {
      const validation = await this.validateCoupon(code, userId, cartTotal);
      results.push({
        code: code.toUpperCase(),
        valid: validation.valid,
        reason: validation.reason,
        discount: validation.coupon?.discountAmount
      });
    }
    
    return results;
  }

  async getCouponRedemptionTimeline(couponId, days = 30) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found');
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orders = await Order.find({
      'coupon.code': coupon.code,
      createdAt: { $gte: startDate }
    }).select('createdAt discount totalAmount');
    
    const timeline = [];
    const dailyMap = new Map();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        count: 0,
        totalDiscount: 0,
        totalOrderValue: 0
      });
    }
    
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        const day = dailyMap.get(dateStr);
        day.count++;
        day.totalDiscount += order.discount || 0;
        day.totalOrderValue += order.totalAmount;
      }
    }
    
    for (const [date, data] of dailyMap) {
      timeline.push(data);
    }
    
    timeline.sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      couponCode: coupon.code,
      name: coupon.name,
      timeline,
      summary: {
        totalRedemptions: orders.length,
        totalDiscountGiven: timeline.reduce((sum, day) => sum + day.totalDiscount, 0),
        averageDiscountPerUse: orders.length > 0 
          ? timeline.reduce((sum, day) => sum + day.totalDiscount, 0) / orders.length 
          : 0
      }
    };
  }
}

module.exports = new CouponService()