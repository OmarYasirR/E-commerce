const cron = require('node-cron');
const Product = require('../../models/Product.model');
const logger = require('../../utils/logger');

const updateInventory = async () => {
  try {
    const lowStockProducts = await Product.find({
      quantity: { $lt: 10 },
      status: 'active'
    }).select('name sku quantity');
    
    if (lowStockProducts.length > 0) {
      logger.warn(`Low stock alert: ${lowStockProducts.length} products have low inventory`);
      
      lowStockProducts.forEach(product => {
        logger.warn(`Low stock: ${product.name} (SKU: ${product.sku}) - Only ${product.quantity} left`);
      });
    }
    
    const outOfStockProducts = await Product.updateMany(
      { quantity: 0, status: 'active' },
      { status: 'inactive' }
    );
    
    if (outOfStockProducts.modifiedCount > 0) {
      logger.info(`Marked ${outOfStockProducts.modifiedCount} products as out of stock`);
    }
  } catch (error) {
    logger.error('Error updating inventory:', error);
  }
};

// Run every hour
cron.schedule('0 * * * *', updateInventory);

module.exports = updateInventory;