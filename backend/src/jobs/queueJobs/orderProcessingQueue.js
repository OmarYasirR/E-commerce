const Queue = require('bull');
const logger = require('../../utils/logger');

// Check Redis availability
let orderProcessingQueue = null;

try {
  if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
    const redisConfig = process.env.REDIS_URL || {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    };
    
    orderProcessingQueue = new Queue('order-processing', redisConfig);
    logger.info('Order processing queue initialized with Redis');
  } else {
    logger.warn('Redis not configured. Order processing queue disabled.');
  }
} catch (error) {
  logger.error('Failed to initialize order processing queue:', error);
}

// Create a mock queue that processes jobs synchronously when Redis is unavailable
const createMockQueue = () => {
  const mockQueue = {
    add: async (jobName, data) => {
      logger.info(`Mock queue: Processing ${jobName} for order ${data.orderId} synchronously`);
      // We will not process here; instead we rely on the controller to handle fallback
      // Return a fake job ID
      return { id: `mock-${Date.now()}` };
    },
    process: () => {},   // no-op
    on: () => {}
  };
  return mockQueue;
};

// Export the queue or mock
module.exports = {
  orderProcessingQueue: orderProcessingQueue || createMockQueue()
};