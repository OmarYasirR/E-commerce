const cron = require('node-cron');
const Cart = require('../../models/Cart.model');
const logger = require('../../utils/logger');

const cleanupExpiredCarts = async () => {
  try {
    const result = await Cart.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    logger.info(`Cleaned up ${result.deletedCount} expired carts`);
  } catch (error) {
    logger.error('Error cleaning up expired carts:', error);
  }
};

// Run every day at midnight
cron.schedule('0 0 * * *', cleanupExpiredCarts);

module.exports = cleanupExpiredCarts;