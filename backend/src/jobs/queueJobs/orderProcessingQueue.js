// backend/src/jobs/queueJobs/orderProcessingQueue.js
const Queue = require('bull');
const Order = require('../../models/Order.model');
const Product = require('../../models/Product.model');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');

// Check if Redis is configured
let orderProcessingQueue = null;

try {
  // Only create queue if Redis URL is available
  if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
    const redisConfig = process.env.REDIS_URL || {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    };
    
    orderProcessingQueue = new Queue('order-processing', redisConfig);
    
    orderProcessingQueue.process(async (job) => {
      const { orderId } = job.data;
      
      try {
        const order = await Order.findById(orderId).populate('user');
        
        if (!order) {
          throw new Error(`Order not found: ${orderId}`);
        }
        
        // Process order logic here
        order.status = 'processing';
        order.addTimelineEntry('processing', 'Order is being processed');
        await order.save();
        
        logger.info(`Order ${order.orderNumber} processed successfully`);
        
        return { success: true, orderId: order._id };
      } catch (error) {
        logger.error(`Error processing order ${orderId}:`, error);
        throw error;
      }
    });
    
    orderProcessingQueue.on('completed', (job, result) => {
      logger.info(`Order processing job ${job.id} completed for order ${result.orderId}`);
    });
    
    orderProcessingQueue.on('failed', (job, err) => {
      logger.error(`Order processing job ${job.id} failed:`, err);
    });
    
    logger.info('Order processing queue initialized');
  } else {
    logger.warn('Redis not configured. Order processing queue disabled.');
  }
} catch (error) {
  logger.error('Failed to initialize order processing queue:', error);
}

// Create a mock queue for when Redis is not available
const createMockQueue = () => {
  const mockQueue = {
    add: async (name, data) => {
      logger.info(`Mock queue: Processing order ${data.orderId} synchronously`);
      // Process synchronously instead of via queue
      try {
        const Order = require('../../models/Order.model');
        const order = await Order.findById(data.orderId).populate('user');
        if (order) {
          order.status = 'processing';
          order.addTimelineEntry('processing', 'Order is being processed');
          await order.save();
          logger.info(`Order ${order.orderNumber} processed successfully (sync mode)`);
        }
        return { id: `mock-${Date.now()}` };
      } catch (error) {
        logger.error('Mock queue processing error:', error);
        throw error;
      }
    },
    process: () => {},
    on: () => {}
  };
  return mockQueue;
};

// Export the queue or a mock version
module.exports = {
  orderProcessingQueue: orderProcessingQueue || createMockQueue()
};