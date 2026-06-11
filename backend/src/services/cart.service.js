const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/ApiError');
const redisService = require('./redis.service');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId });
      await cart.save();
    }
    
    return cart.getSummary();
  }
  
  async addToCart(userId, productId, quantity, variant = null) {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId });
    }
    
    // Add item
    await cart.addItem(productId, quantity, variant);
    
    // Clear cache
    await redisService.del(`cart:${userId}`);
    
    return cart.getSummary();
  }
  
  async updateCartItem(userId, productId, quantity, variant = null) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }
    
    await cart.updateQuantity(productId, quantity, variant);
    
    await redisService.del(`cart:${userId}`);
    
    return cart.getSummary();
  }
  
  async removeFromCart(userId, productId, variant = null) {
    console.log('Removing from cart:', productId, 'Variant:', variant);
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }
    
    await cart.removeItem(productId, variant);
    
    await redisService.del(`cart:${userId}`);
    
    return cart.getSummary();
  }
  
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }
    
    await cart.clearCart();
    
    await redisService.del(`cart:${userId}`);
    
    return cart.getSummary();
  }
}

module.exports = new CartService();