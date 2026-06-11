const mongoose = require('mongoose');

const userFixture = {
  validUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    role: 'user'
  },
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123',
    role: 'admin'
  }
};

const productFixture = {
  validProduct: {
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    quantity: 100,
    category: new mongoose.Types.ObjectId(),
    status: 'active'
  }
};

const orderFixture = {
  validOrder: {
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        quantity: 2,
        price: 99.99,
        total: 199.98
      }
    ],
    subtotal: 199.98,
    shippingCost: 10,
    tax: 20,
    totalAmount: 229.98,
    paymentMethod: 'stripe',
    shippingAddress: {
      fullName: 'Test User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'Test Country',
      phone: '+1234567890'
    }
  }
};

module.exports = {
  userFixture,
  productFixture,
  orderFixture
};