const User = require('../models/User.model');
const Address = require('../models/Address.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/ApiError');

class UserService {
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-password')
      .populate('addresses')
      .populate('wishlist', 'name price images');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  }
  
  async getUserByEmail(email) {
    return await User.findOne({ email }).select('-password');
  }
  
  async updateUser(userId, updateData) {
    const allowedUpdates = ['name', 'phoneNumber', 'preferences'];
    const filteredData = {};
    
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  }
  
  async getUserAddresses(userId) {
    return await Address.find({ user: userId, isDeleted: false })
      .sort({ isDefault: -1, createdAt: -1 });
  }
  
  async addAddress(userId, addressData) {
    const address = new Address({
      ...addressData,
      user: userId
    });
    
    if (addressData.isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }
    
    await address.save();
    
    await User.findByIdAndUpdate(userId, {
      $push: { addresses: address._id }
    });
    
    return address;
  }
  
  async updateAddress(addressId, updateData, userId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    
    if (!address) {
      throw new ApiError(404, 'Address not found');
    }
    
    if (updateData.isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }
    
    Object.assign(address, updateData);
    await address.save();
    
    return address;
  }
  
  async deleteAddress(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    
    if (!address) {
      throw new ApiError(404, 'Address not found');
    }
    
    await address.softDelete();
    
    await User.findByIdAndUpdate(userId, {
      $pull: { addresses: addressId }
    });
    
    return true;
  }
  
  async setDefaultAddress(addressId, userId) {
    await Address.updateMany(
      { user: userId, isDefault: true },
      { isDefault: false }
    );
    
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      { isDefault: true },
      { new: true }
    );
    
    if (!address) {
      throw new ApiError(404, 'Address not found');
    }
    
    return address;
  }
  
  async getWishlist(userId) {
    const user = await User.findById(userId)
      .populate('wishlist', 'name price images ratings quantity');
    
    return user.wishlist;
  }
  
  async addToWishlist(userId, productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name price images ratings');
    
    return user.wishlist;
  }
  
  async removeFromWishlist(userId, productId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name price images ratings');
    
    return user.wishlist;
  }
  
  async getUserOrders(userId, { page = 1, limit = 10, status = null }) {
    const query = { user: userId };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name images'),
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
  
  async getOrderDetails(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name images slug');
    
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    
    return order;
  }
  
  async getUserStats(userId) {
    const [orderStats, reviewCount, wishlistCount] = await Promise.all([
      Order.aggregate([
        { $match: { user: userId } },
        { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }}
      ]),
      require('../models/Review.model').countDocuments({ user: userId }),
      User.findById(userId).select('wishlist').then(user => user.wishlist.length)
    ]);
    
    return {
      orders: orderStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 },
      reviews: reviewCount,
      wishlist: wishlistCount
    };
  }
}

module.exports = new UserService();