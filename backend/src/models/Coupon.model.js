const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maximumDiscountAmount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1,
    min: [1, 'Per user limit must be at least 1']
  },
  usersUsed: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedCount: {
      type: Number,
      default: 1
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  userGroups: [{
    type: String,
    enum: ['new', 'regular', 'vip']
  }],
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFirstOrderOnly: {
    type: Boolean,
    default: false
  },
  stackable: {
    type: Boolean,
    default: false
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'disabled'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ status: 1, isActive: 1 });
couponSchema.index({ discountType: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = async function(userId, cartTotal = 0) {
  const now = new Date();
  
  // Check basic validity
  if (!this.isActive || this.status !== 'active') {
    return { valid: false, reason: 'Coupon is not active' };
  }
  
  if (now < this.startDate) {
    return { valid: false, reason: 'Coupon has not started yet' };
  }
  
  if (now > this.endDate) {
    return { valid: false, reason: 'Coupon has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  
  // Check per user limit
  if (userId) {
    const userUsage = this.usersUsed.find(u => u.user.toString() === userId.toString());
    if (userUsage && userUsage.usedCount >= this.perUserLimit) {
      return { valid: false, reason: 'You have reached the usage limit for this coupon' };
    }
  }
  
  // Check minimum order amount
  if (cartTotal < this.minimumOrderAmount) {
    return { 
      valid: false, 
      reason: `Minimum order amount of ${this.minimumOrderAmount} required` 
    };
  }
  
  // Check first order only
  if (this.isFirstOrderOnly && userId) {
    const Order = mongoose.model('Order');
    const orderCount = await Order.countDocuments({ 
      user: userId,
      paymentStatus: 'paid'
    });
    if (orderCount > 0) {
      return { valid: false, reason: 'Coupon is only for first time orders' };
    }
  }
  
  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(cartTotal) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (cartTotal * this.discountValue) / 100;
    if (this.maximumDiscountAmount) {
      discount = Math.min(discount, this.maximumDiscountAmount);
    }
  } else {
    discount = this.discountValue;
  }
  
  return Math.min(discount, cartTotal);
};

// Mark coupon as used
couponSchema.methods.markAsUsed = async function(userId, orderId) {
  this.usageCount += 1;
  
  const userUsage = this.usersUsed.find(u => u.user.toString() === userId.toString());
  if (userUsage) {
    userUsage.usedCount += 1;
    userUsage.usedAt = new Date();
    userUsage.orderId = orderId;
  } else {
    this.usersUsed.push({
      user: userId,
      usedCount: 1,
      usedAt: new Date(),
      orderId
    });
  }
  
  await this.save();
};

// Auto-update status based on date
couponSchema.pre('save', function(next) {
  const now = new Date();
  if (now > this.endDate && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);