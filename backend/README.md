# E-Commerce Backend API

A robust, production-ready e-commerce backend built with Node.js, Express, MongoDB, and Redis.

## Features

- 🔐 **Authentication & Authorization** - JWT, OAuth2.0 (Google), Role-based access
- 📦 **Product Management** - CRUD operations, categories, reviews, filtering
- 🛒 **Shopping Cart** - Redis-backed cart system with persistence
- 💳 **Payment Integration** - Stripe, Razorpay support
- 📧 **Email Notifications** - Order confirmations, password reset, welcome emails
- 🚀 **Performance** - Redis caching, CDN (Cloudinary), compression
- 🔄 **Background Jobs** - Bull queue for async operations
- 📊 **Real-time Updates** - Socket.io for order tracking
- 🛡️ **Security** - Rate limiting, sanitization, Helmet.js, CORS
- 📝 **Logging** - Winston with rotating files
- 🧪 **Testing** - Jest for unit and integration tests

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT, Passport.js
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe, Razorpay
- **Email**: Nodemailer
- **Queue**: Bull
- **WebSockets**: Socket.io
- **Validation**: express-validator
- **Testing**: Jest, Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install