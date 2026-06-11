const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email service not configured. Email sending will be disabled.');
      logger.warn('Add EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD to .env');
      this.isConfigured = false;
      return;
    }
    console.log('Initializing email service with host:', process.env.EMAIL_HOST);
    console.log('Email user:', process.env.EMAIL_USER);
    console.log('Email port:', process.env.EMAIL_PORT || '587');
    console.log('Email from:', process.env.EMAIL_FROM || `"E-Commerce" <${process.env.EMAIL_USER}>`);

    // Skip in development unless explicitly enabled
    // if (process.env.NODE_ENV === 'development' && process.env.ENABLE_EMAIL !== 'true') {
    //   logger.info('Email service disabled in development mode.');
    //   logger.info('Set ENABLE_EMAIL=true in .env to enable emails');
    //   this.isConfigured = false;
    //   return;
    // }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        // Add timeout options
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      
      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email transporter verification failed:', error.message);
          this.isConfigured = false;
        } else {
          logger.info('Email service configured successfully');
          this.isConfigured = true;
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email service:', error.message);
      this.isConfigured = false;
    }

    this.loadTemplates();
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    if (fs.existsSync(templatesDir)) {
      const templateFiles = fs.readdirSync(templatesDir);
      
      templateFiles.forEach((file) => {
        if (file.endsWith('.handlebars')) {
          const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
          const name = path.basename(file, '.handlebars');
          this.templates[name] = handlebars.compile(content);
        }
      });
      
      if (Object.keys(this.templates).length > 0) {
        logger.info(`Loaded ${Object.keys(this.templates).length} email templates`);
      }
    } else {
      logger.warn('Email templates directory not found');
    }
  }

  async sendEmail({ to, subject, template, context, attachments = [] }) {
    if (!this.isConfigured || !this.transporter) {
      logger.debug(`Email not sent (service disabled): ${subject} to ${to}`);
      return { messageId: 'mock-email-id', skipped: true, reason: 'Email service not configured' };
    }

    try {
      if (!this.templates[template]) {
        throw new Error(`Template ${template} not found`);
      }

      const html = this.templates[template](context);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || `"E-Commerce" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId} to ${to}`);
      return info;  
    } catch (error) {
      logger.error(`Email send error: ${error.message}`);
      // Don't throw error - return mock response
      return { error: error.message, skipped: true };
    }
  }

  async sendWelcomeEmail(user) {
    if (!user || !user.email) return;
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to ShopHub!',
      template: 'welcomeEmail',
      context: {
        name: user.name,
        loginUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`
      }
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    if (!user || !user.email) return;
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      context: {
        name: user.name,
        resetUrl,
        expiryTime: '1 hour'
      }
    });
  }

  async sendOrderConfirmation(order, user) {
    if (!order || !user || !user.email) return;
    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      template: 'orderConfirmation',
      context: {
        name: user.name,
        orderNumber: order.orderNumber,
        items: order.items,
        total: order.totalAmount,
        shippingAddress: order.shippingAddress,
        orderUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`
      }
    });
  }

  async sendOrderStatusUpdate(order, user, status) {
    if (!order || !user || !user.email) return;
    return this.sendEmail({
      to: user.email,
      subject: `Order Status Update #${order.orderNumber}`,
      template: 'orderStatusUpdate',
      context: {
        name: user.name,
        orderNumber: order.orderNumber,
        status,
        trackingUrl: order.trackingUrl,
        orderUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`
      }
    });
  }
}

module.exports = new EmailService();