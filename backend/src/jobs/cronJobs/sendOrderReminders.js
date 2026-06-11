const cron = require('node-cron');
const Order = require('../../models/Order.model');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');

const sendOrderReminders = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const orders = await Order.find({
      status: 'delivered',
      deliveredAt: { $lte: threeDaysAgo },
      'timeline.reminderSent': { $ne: true }
    }).populate('user');
    
    for (const order of orders) {
      await emailService.sendEmail({
        to: order.user.email,
        subject: `How was your shopping experience?`,
        template: 'reviewReminder',
        context: {
          name: order.user.name,
          orderNumber: order.orderNumber,
          orderUrl: `${process.env.CLIENT_URL}/orders/${order._id}`
        }
      });
      
      order.timeline.push({
        status: 'reminder_sent',
        description: 'Review reminder email sent'
      });
      await order.save();
      
      logger.info(`Sent review reminder for order ${order.orderNumber}`);
    }
  } catch (error) {
    logger.error('Error sending order reminders:', error);
  }
};

// Run every day at 10 AM
cron.schedule('0 10 * * *', sendOrderReminders);

module.exports = sendOrderReminders;