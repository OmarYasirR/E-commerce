const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
  }


  ensureInitialized() {
    if (!this.transporter) {
      this.init();
    }
  }

    init() {
    require('dotenv').config({ override: true });
    
    console.log('Initializing with:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    this.loadTemplates();
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    if (fs.existsSync(templatesDir)) {
      const files = fs.readdirSync(templatesDir);
      files.forEach((file) => {
        if (file.endsWith('.handlebars')) {
          const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
          const name = path.basename(file, '.handlebars');
          this.templates[name] = handlebars.compile(content);
        }
      });
    }
  }

  async sendEmail({ to, subject, template, context, attachments = [] }) {
    this.ensureInitialized()
    try {
      if (!this.templates[template]) {
        throw new Error(`Template ${template} not found`);
      }

      const html = this.templates[template](context);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: subject,
        html: html,
        attachments: attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    return this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'welcomeEmail',
      context: {
        name: user.name,
        verificationUrl,
        loginUrl: `${process.env.CLIENT_URL}/login`
      }
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
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
    console.log(user.email);
    console.log(process.env.EMAIL_HOST);
    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      template: 'orderConfirmation',
      context: {
        name: user.name,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: order.subtotal,
        shipping: order.shippingCost,
        tax: order.tax,
        discount: order.discount,
        total: order.totalAmount,
        shippingAddress: order.shippingAddress,
        orderUrl: `${process.env.CLIENT_URL}/orders/${order._id}`
      }
    });
  }

  async sendOrderStatusUpdate(order, user, status) {
    let statusMessage = '';
    switch (status) {
      case 'confirmed':
        statusMessage = 'Your order has been confirmed and is being processed.';
        break;
      case 'shipped':
        statusMessage = `Your order has been shipped! Tracking number: ${order.trackingNumber}`;
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. Enjoy your purchase!';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled.';
        break;
    }

    return this.sendEmail({
      to: user.email,
      subject: `Order Status Update #${order.orderNumber} - ${status.toUpperCase()}`,
      template: 'orderStatusUpdate',
      context: {
        name: user.name,
        orderNumber: order.orderNumber,
        status,
        statusMessage,
        trackingUrl: order.trackingUrl,
        orderUrl: `${process.env.CLIENT_URL}/orders/${order._id}`
      }
    });
  }
}

module.exports = new EmailService();
