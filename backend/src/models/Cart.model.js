// src/models/Cart.model.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    product: {
      name: {
        type: String,
        required: true
      },
      slug: String,
      price: {
        type: Number,
        required: true
      },
      compareAtPrice: Number,
      images: [{
        url: String,
        publicId: String,
        isMain: Boolean
      }],
      sku: String,
      weight: {
        value: Number,
        unit: String
      },
      brand: String,
      isDigital: {
        type: Boolean,
        default: false
      }
    },
    variant: {
      type: Map,
      of: String,
      default: new Map()
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  total: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    index: { expires: '30d' }
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ expiresAt: 1 });

// Calculate cart totals
cartSchema.methods.calculateTotals = async function() {
  let subtotal = 0;
  let totalItems = 0;
  
  for (const item of this.items) {
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;
    item.total = item.price * item.quantity;
  }
  
  this.subtotal = subtotal;
  this.totalItems = totalItems;
  this.total = subtotal - this.discount;
  
  await this.save();
  return this;
};

// Add item to cart with denormalized product data
cartSchema.methods.addItem = async function(productId, quantity = 1, variant = null) {
  // Validate productId
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Validate quantity
  if (!quantity || quantity < 1) {
    quantity = 1;
  }
  
  // Check stock
  if (product.quantity < quantity) {
    throw new Error(`Only ${product.quantity} items available in stock`);
  }
  
  // Convert productId to string for comparison
  const productIdStr = productId.toString();
  
  // Check if item already exists in cart (same product and variant)
  const existingItemIndex = this.items.findIndex(item => {
    if (!item.productId) return false;
    
    const productMatch = item.productId.toString() === productIdStr;
    if (!variant) return productMatch;
    
    const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
    return productMatch && variantMatch;
  });
  
  // Prepare denormalized product data
  const productData = {
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    sku: product.sku,
    weight: product.weight,
    brand: product.brand,
    isDigital: product.isDigital || false
  };
  
  if (existingItemIndex !== -1) {
    // Update existing item
    const newQuantity = this.items[existingItemIndex].quantity + quantity;
    
    // Check stock for updated quantity
    if (product.quantity < newQuantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }
    
    this.items[existingItemIndex].quantity = newQuantity;
    this.items[existingItemIndex].total = product.price * newQuantity;
    // Update price in case it changed
    this.items[existingItemIndex].price = product.price;
  } else {
    // Add new item with denormalized product data
    this.items.push({
      productId: productId,
      product: productData,
      variant: variant || new Map(),
      quantity: quantity,
      price: product.price,
      total: product.price * quantity
    });
  }
  
  await this.calculateTotals();
  return this;
};

// Update item quantity
cartSchema.methods.updateQuantity = async function(productId, quantity, variant = null) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  const productIdStr = productId.toString();
  
  const item = this.items.find(item => {
    if (!item.productId) return false;
    
    const productMatch = item.productId.toString() === productIdStr;
    if (!variant) return productMatch;
    
    const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
    return productMatch && variantMatch;
  });
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    return this.removeItem(productId, variant);
  }
  
  // Check stock
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (product && product.quantity < quantity) {
    throw new Error(`Only ${product.quantity} items available in stock`);
  }
  
  // Update price and product info in case they changed
  if (product) {
    item.price = product.price;
    item.product.price = product.price;
    item.product.compareAtPrice = product.compareAtPrice;
    item.product.name = product.name;
  }
  
  item.quantity = quantity;
  item.total = item.price * quantity;
  
  await this.calculateTotals();
  return this;
};

// Remove item from cart
cartSchema.methods.removeItem = async function(productId, variant = null) {
  if (!productId) {
    throw new Error('Product ID is required');
  } 
  
  const productIdStr = productId.toString();
  console.log('Removing item:', productIdStr, 'Variant:', variant);
  console.log(this.items[0]);
  
  this.items = this.items.filter(item => {
    if (!item.productId) return true;
    
    const productMatch = item.productId.toString() === productIdStr;
    if (variant) {
      const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
      return !(productMatch && variantMatch);
    }
    return !productMatch;
  });
  
  console.log(this.items);
  await this.calculateTotals();
  return this;
};

// Clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.totalItems = 0;
  this.subtotal = 0;
  this.discount = 0;
  this.couponCode = null;
  this.total = 0;
  
  await this.save();
  return this;
};

// Sync cart with latest product prices
cartSchema.methods.syncPrices = async function() {
  const Product = mongoose.model('Product');
  let updated = false;
  
  for (const item of this.items) {
    if (!item.productId) continue;
    
    const product = await Product.findById(item.productId);
    if (product && product.price !== item.price) {
      item.price = product.price;
      item.total = product.price * item.quantity;
      item.product.price = product.price;
      item.product.compareAtPrice = product.compareAtPrice;
      updated = true;
    }
  }
  
  if (updated) {
    await this.calculateTotals();
  }
  
  return this;
};

// Get cart summary for response
cartSchema.methods.getSummary = function() {
  return {
    items: this.items.map(item => ({
      productId: item.productId,
      product: item.product,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      addedAt: item.addedAt
    })),
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    discount: this.discount,
    couponCode: this.couponCode,
    total: this.total
  };
};

module.exports = mongoose.model('Cart', cartSchema);