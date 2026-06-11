const User = require('./User.model');
const Product = require('./Product.model');
const Category = require('./Category.model');
const Order = require('./Order.model');
const Cart = require('./Cart.model');
const Review = require('./Review.model');
const Coupon = require('./Coupon.model');
const Payment = require('./Payment.model');
const Address = require('./Address.model');

// Export all models
module.exports = {
  User,
  Product,
  Category,
  Order,
  Cart,
  Review,
  Coupon,
  Payment,
  Address
};