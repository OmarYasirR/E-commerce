const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'cod', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentIntentId: String,
  paymentMethodId: String,
  customerId: String,
  
  // Stripe specific fields
  stripe: {
    paymentIntent: String,
    clientSecret: String,
    ephemeralKey: String,
    publishableKey: String,
    chargeId: String,
    invoiceId: String
  },
  
  // Razorpay specific fields
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
    notes: Map
  },
  
  // Paypal specific fields
  paypal: {
    orderId: String,
    captureId: String,
    payerId: String,
    status: String
  },
  
  // Bank transfer specific fields
  bankTransfer: {
    bankName: String,
    accountNumber: String,
    referenceNumber: String,
    transferDate: Date,
    receiptUrl: String
  },
  
  // Common fields
  metadata: {
    type: Map,
    of: String
  },
  
  receiptUrl: String,
  invoiceUrl: String,
  
  paymentDetails: {
    cardBrand: String,
    cardLast4: String,
    cardExpiry: String,
    email: String,
    phone: String,
    billingAddress: Map
  },
  
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    createdAt: { type: Date, default: Date.now },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  refundedAmount: {
    type: Number,
    default: 0
  },
  
  paidAt: Date,
  failedAt: Date,
  failedReason: String,
  
  webhookReceived: {
    type: Boolean,
    default: false
  },
  
  webhookData: Map,
  
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'stripe.paymentIntent': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });

// Generate transaction ID before saving
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

// Update payment status and order payment status
paymentSchema.methods.updateStatus = async function(status, metadata = {}) {
  const oldStatus = this.paymentStatus;
  this.paymentStatus = status;
  
  if (metadata) {
    Object.assign(this.metadata || {}, metadata);
  }
  
  if (status === 'success') {
    this.paidAt = new Date();
  } else if (status === 'failed') {
    this.failedAt = new Date();
    this.failedReason = metadata.reason || 'Payment failed';
  }
  
  await this.save();
  
  // Update order payment status
  const Order = mongoose.model('Order');
  const order = await Order.findById(this.order);
  if (order) {
    order.paymentStatus = status === 'success' ? 'paid' : 
                         status === 'refunded' ? 'refunded' : 
                         status === 'failed' ? 'failed' : 'pending';
    
    if (status === 'success') {
      order.paymentDetails = {
        transactionId: this.transactionId,
        paymentId: this.paymentIntentId || this.razorpay?.paymentId,
        paidAt: this.paidAt
      };
    }
    
    await order.save();
  }
  
  return this;
};

// Process refund
paymentSchema.methods.processRefund = async function(amount, reason = 'Customer request', userId = null) {
  if (this.paymentStatus !== 'success') {
    throw new Error('Cannot refund a payment that was not successful');
  }
  
  if (amount > this.amount - this.refundedAmount) {
    throw new Error('Refund amount exceeds available balance');
  }
  
  const refund = {
    refundId: `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    amount,
    reason,
    status: 'processing',
    processedBy: userId
  };
  
  this.refunds.push(refund);
  this.refundedAmount += amount;
  
  if (this.refundedAmount >= this.amount) {
    this.paymentStatus = 'refunded';
  } else if (this.refundedAmount > 0) {
    this.paymentStatus = 'partially_refunded';
  }
  
  await this.save();
  
  // Update order status if fully refunded
  if (this.paymentStatus === 'refunded') {
    const Order = mongoose.model('Order');
    await Order.findByIdAndUpdate(this.order, { paymentStatus: 'refunded' });
  }
  
  return refund;
};

// Get payment summary
paymentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    orderId: this.order,
    amount: this.amount,
    currency: this.currency,
    method: this.paymentMethod,
    status: this.paymentStatus,
    transactionId: this.transactionId,
    paidAt: this.paidAt,
    refundedAmount: this.refundedAmount,
    refundsCount: this.refunds.length
  };
};

module.exports = mongoose.model('Payment', paymentSchema);