const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con cannot exceed 100 characters']
  }],
  images: [{
    url: String,
    publicId: String
  }],
  videos: [{
    url: String,
    publicId: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isHelpful: Boolean,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  adminResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, isApproved: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpful: -1 });

// Populate user details
reviewSchema.pre(/^find/, function(next) {
  this.populate('user', 'name avatar');
  next();
});

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Update product rating when review is updated
reviewSchema.post('findOneAndUpdate', async function() {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await doc.constructor.updateProductRating(doc.product);
  }
});

// Update product rating when review is deleted
reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const Product = mongoose.model('Product');
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true, status: 'approved' } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  const product = await Product.findById(productId);
  if (product) {
    if (result.length > 0) {
      product.ratings = {
        average: Math.round(result[0].avgRating * 10) / 10,
        count: result[0].count
      };
    } else {
      product.ratings = { average: 0, count: 0 };
    }
    await product.save();
  }
};

// Mark review as helpful
reviewSchema.methods.markHelpful = async function(userId, isHelpful = true) {
  const existing = this.helpful.users.find(u => u.user.toString() === userId.toString());
  
  if (existing) {
    if (existing.isHelpful !== isHelpful) {
      this.helpful.count += isHelpful ? 1 : -1;
      existing.isHelpful = isHelpful;
    }
  } else {
    this.helpful.users.push({ user: userId, isHelpful });
    if (isHelpful) this.helpful.count += 1;
  }
  
  await this.save();
  return this;
};

// Report review
reviewSchema.methods.report = async function(userId, reason) {
  const existing = this.reported.users.find(u => u.user.toString() === userId.toString());
  
  if (!existing) {
    this.reported.users.push({ user: userId, reason });
    this.reported.count += 1;
    
    // Auto-block after 10 reports
    if (this.reported.count >= 10) {
      this.reported.isBlocked = true;
      this.status = 'blocked';
      this.isApproved = false;
    }
    
    await this.save();
  }
  
  return this;
};

// Admin approve review
reviewSchema.methods.approve = async function(adminId) {
  this.isApproved = true;
  this.status = 'approved';
  this.reported.isBlocked = false;
  await this.save();
  await this.constructor.updateProductRating(this.product);
  return this;
};

// Admin reject review
reviewSchema.methods.reject = async function(adminId, reason) {
  this.isApproved = false;
  this.status = 'rejected';
  this.adminResponse = {
    comment: reason,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  await this.save();
  await this.constructor.updateProductRating(this.product);
  return this;
};

module.exports = mongoose.model('Review', reviewSchema);