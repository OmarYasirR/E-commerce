const Queue = require('bull');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');

let emailQueue = null;

try {
  if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
    const redisConfig = process.env.REDIS_URL || {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    };
    
    emailQueue = new Queue('email-queue', redisConfig);
    
    emailQueue.process(async (job) => {
      const { type, data } = job.data;
      
      try {
        switch (type) {
          case 'welcome':
            await emailService.sendWelcomeEmail(data.user);
            break;
          case 'orderConfirmation':
            await emailService.sendOrderConfirmation(data.order, data.user);
            break;
          case 'passwordReset':
            await emailService.sendPasswordResetEmail(data.user, data.token);
            break;
          case 'orderUpdate':
            await emailService.sendOrderStatusUpdate(data.order, data.user, data.status);
            break;
          default:
            logger.warn(`Unknown email type: ${type}`);
        }
        
        logger.info(`Email sent: ${type} to ${data.user?.email}`);
      } catch (error) {
        logger.error(`Failed to send email: ${type}`, error);
        throw error;
      }
    });
    
    logger.info('Email queue initialized');
  } else {
    logger.warn('Redis not configured. Email queue disabled - emails will be sent synchronously');
  }
} catch (error) {
  logger.error('Failed to initialize email queue:', error);
}

// Create mock queue for when Redis is not available
const createMockEmailQueue = () => {
  return {
    add: async (type, data) => {
      logger.info(`Sending email synchronously: ${type}`);
      try {
        switch (type) {
          case 'welcome':
            await emailService.sendWelcomeEmail(data.user);
            break;
          case 'orderConfirmation':
            await emailService.sendOrderConfirmation(data.order, data.user);
            break;
          case 'passwordReset':
            await emailService.sendPasswordResetEmail(data.user, data.token);
            break;
          case 'orderUpdate':
            await emailService.sendOrderStatusUpdate(data.order, data.user, data.status);
            break;
        }
        return { id: `mock-${Date.now()}` };
      } catch (error) {
        logger.error(`Failed to send email synchronously:`, error);
        throw error;
      }
    }
  };
};

module.exports = emailQueue || createMockEmailQueue();