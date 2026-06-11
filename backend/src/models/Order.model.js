// backend/src/models/Order.model.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true  // Allow null/undefined during initial save
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    variant: Map,
    image: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  shippingMethod: {
    type: String,
    default: 'standard'  // Add default value
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  coupon: {
    code: String,
    discount: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'stripe', 'razorpay', 'paypal'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentId: String,
    signature: String,
    paidAt: Date
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  billingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  notes: String,
  invoiceUrl: String,
  timeline: [{
    status: String,
    description: String,
    timestamp: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before validation
orderSchema.pre('validate', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments() + 1;
    this.orderNumber = `ORD-${year}${month}-${String(count).padStart(6, '0')}`;
  }
  next();
});

// Add timeline entry
orderSchema.methods.addTimelineEntry = function(status, description, userId = null) {
  this.timeline.push({
    status,
    description,
    by: userId
  });
};

// Update order status
orderSchema.methods.updateStatus = async function(newStatus, userId, description = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  this.addTimelineEntry(newStatus, description || `Order status changed from ${oldStatus} to ${newStatus}`, userId);
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  await this.save();
};

module.exports = mongoose.model('Order', orderSchema);