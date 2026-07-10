const { orderProcessingQueue } = require('./queueJobs/orderProcessingQueue');
const orderService = require('../../services/order.service');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');
const paymentService = require('../../services/payment.service');

/**
 * Processor for 'process-order' job.
 * - Updates inventory
 * - Confirms payment (placeholder)
 * - Changes order status to 'confirmed'
 * - Triggers a subsequent job to send confirmation email (optional)
 */
orderProcessingQueue.process('process-order', async (job) => {
  const { orderId } = job.data;
  logger.info(`Processing order ${orderId} (attempt ${job.attemptsMade + 1})`);

  try {
    // 1. Fetch the order (ensure it exists and is not already processed)
    const order = await orderService.getOrderById(orderId); // might need to expose admin-level getter
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Prevent duplicate processing
    if (order.status !== 'pending') {
      logger.warn(`Order ${orderId} already processed with status ${order.status}. Skipping.`);
      return { skipped: true, reason: `Already ${order.status}` };
    }

    // 3. Simulate inventory reservation / deduction
    //    In a real app, you'd call an inventory service.
    //    Here we just log.
    for (const item of order.items) {
      // await inventoryService.reserveStock(item.productId, item.quantity);
      logger.debug(`Reserved ${item.quantity} of product ${item.productId}`);
    }

    await paymentService.confirmPayment(order.paymentId);
    logger.debug(`Payment confirmed for order ${orderId}`);

    // 5. Update order status to 'confirmed'
    await orderService.updateOrderStatus(orderId, 'confirmed', null, 'Order confirmed via queue processing');

    // 6. Optionally, queue the confirmation email as a separate job
    //    (This decouples email sending from the heavy processing, but we could also send it here.)
    await orderProcessingQueue.add('send-order-confirmation', { orderId, userId: order.user._id });

    logger.info(`Order ${orderId} processed successfully.`);
    return { success: true, orderId, newStatus: 'confirmed' };

  } catch (error) {
    logger.error(`Order processing job ${job.id} failed for order ${orderId}:`, error);
    // Bull/BullMQ will automatically retry based on queue settings.
    // You can also manually throw to mark failure.
    throw error; // rethrow to trigger retry
  }
});

/**
 * Processor for 'send-order-confirmation' job.
 * - Sends the order confirmation email to the user.
 * - Handles email failures gracefully (does not affect order status).
 */
orderProcessingQueue.process('send-order-confirmation', async (job) => {
  const { orderId, userId } = job.data;
  logger.info(`Sending confirmation email for order ${orderId} (attempt ${job.attemptsMade + 1})`);

  try {
    // 1. Fetch the order and user
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. If the user is not passed, retrieve from order
    const user = userId ? await userService.getUserById(userId) : order.user;
    if (!user) {
      throw new Error(`User for order ${orderId} not found`);
    }

    // 3. Send the email
    await emailService.sendOrderConfirmation(order, user);

    logger.info(`Confirmation email sent for order ${orderId}`);
    return { success: true, orderId };

  } catch (error) {
    logger.error(`Email job ${job.id} failed for order ${orderId}:`, error);
    // We do NOT rethrow here because we don't want the email failure to block other jobs.
    // The queue can be configured to retry, but we mark it as "failed" manually if needed.
    // Alternatively, throw to let Bull retry.
    // For a non‑critical email, we can just log and not retry.
    // Choose based on your reliability requirements.
    // Option 1: Rethrow to retry (default)
    throw error; 
    // Option 2: Just log and return (but then job is marked as succeeded – not ideal)
    // return { success: false, error: error.message };
  }
});

/**
 * Optional: Event listeners for monitoring.
 */
orderProcessingQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} (${job.name}) completed with result:`, result);
});

orderProcessingQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts:`, error);
});

orderProcessingQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} (${job.name}) stalled – will be re-processed.`);
});

// If using BullMQ, you may also want to handle "error" events for the queue itself.
orderProcessingQueue.on('error', (error) => {
  logger.error('Queue encountered an error:', error);
});

// Log that processors are registered (optional)
logger.info('Order processing queue processors registered.');