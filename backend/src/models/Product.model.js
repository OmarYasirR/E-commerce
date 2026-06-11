const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative']
  },
  costPerItem: {
    type: Number,
    min: [0, 'Cost per item cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  soldQuantity: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  images: [{
    url: String,
    publicId: String,
    alt: String,
    isMain: { type: Boolean, default: false }
  }],
  tags: [String],
  attributes: [{
    name: String,
    value: String
  }],
  variants: [{
    sku: String,
    attributes: Map,
    price: Number,
    quantity: Number,
    images: [String]
  }],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: {
    value: Number,
    unit: { type: String, enum: ['kg', 'g', 'lb', 'oz'], default: 'kg' }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  digitalFile: {
    url: String,
    publicId: String
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'ratings.average': -1 });

// Create slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Update ratings average method
productSchema.methods.updateRatings = async function() {
  const Review = mongoose.model('Review');
  const result = await Review.aggregate([
    { $match: { product: this._id, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (result.length > 0) {
    this.ratings = {
      average: Math.round(result[0].avgRating * 10) / 10,
      count: result[0].count
    };
  } else {
    this.ratings = { average: 0, count: 0 };
  }
  
  await this.save();
};

module.exports = mongoose.model('Product', productSchema);