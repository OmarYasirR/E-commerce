const { orderProcessingQueue } = require('./queueJobs/orderProcessingQueue');
const logger = require('../../utils/logger');
const { paymentService, emailService, orderService } = require('../../services');
const { User } = require('../../models');

/**
 * Processor for 'process-order' job.
 * - Updates inventory
 * - Confirms payment
 * - Changes order status to 'confirmed'
 * - Queues confirmation email
 */
orderProcessingQueue.process('process-order', async (job) => {
  const { orderId } = job.data;
  logger.info(`Processing order ${orderId} (attempt ${job.attemptsMade + 1})`);

  try {
    // 1. Fetch the order with user populated
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Prevent duplicate processing
    if (order.status !== 'pending') {
      logger.warn(`Order ${orderId} already processed with status ${order.status}. Skipping.`);
      return { skipped: true, reason: `Already ${order.status}` };
    }

    // 3. Reserve inventory (placeholder)
    for (const item of order.items) {
      // await inventoryService.reserveStock(item.productId, item.quantity);
      logger.debug(`Reserved ${item.quantity} of product ${item.productId}`);
    }

    // 4. Confirm payment (if paymentId exists)
    if (order.paymentId) {
      await paymentService.confirmPayment(order.paymentId);
      logger.debug(`Payment confirmed for order ${orderId}`);
    }

    // 5. Update order status to 'confirmed'
    await orderService.updateOrderStatus(
      orderId,
      'confirmed',
      null,
      'Order confirmed via queue processing'
    );

    // 6. Queue the confirmation email job
    await orderProcessingQueue.add('send-order-confirmation', {
      orderId,
      userId: order.user._id
    });

    logger.info(`Order ${orderId} processed successfully.`);
    return { success: true, orderId, newStatus: 'confirmed' };

  } catch (error) {
    logger.error(`Order processing job ${job.id} failed for order ${orderId}:`, error);
    throw error; // triggers retry
  }
});

/**
 * Processor for 'send-order-confirmation' job.
 * - Sends the order confirmation email.
 * - On failure, logs but does not retry (optional) – can be adjusted.
 */
orderProcessingQueue.process('send-order-confirmation', async (job) => {
  const { orderId, userId } = job.data;
  logger.info(`Sending confirmation email for order ${orderId} (attempt ${job.attemptsMade + 1})`);

  try {
    // 1. Fetch order and user
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Get user – either from userId or from order.user
    let user = userId ? await User.findById(userId) : order.user;
    if (!user) {
      // Fallback: try to get from order if populated
      user = order.user;
    }
    if (!user) {
      throw new Error(`User for order ${orderId} not found`);
    }

    // 3. Send email
    await emailService.sendOrderConfirmation(order, user);

    logger.info(`Confirmation email sent for order ${orderId}`);
    return { success: true, orderId };

  } catch (error) {
    logger.error(`Email job ${job.id} failed for order ${orderId}:`, error);
    // For non-critical emails, we may choose not to retry:
    // throw error; // uncomment to retry
    // Or just return a failure result (job will be marked as failed but not retried)
    throw error; // I'll keep retry for reliability
  }
});

// Event listeners
orderProcessingQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} (${job.name}) completed.`);
});

orderProcessingQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts:`, error);
});

orderProcessingQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} (${job.name}) stalled – will be re-processed.`);
});

logger.info('Order processing queue processors registered.');