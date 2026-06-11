# ShopHub E-Commerce Platform - Technical Documentation

## Project Overview

ShopHub is a full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js). The platform provides a complete online shopping experience with user authentication, product management, shopping cart functionality, order processing, and payment integration.

## Technology Stack

### Backend Technologies

-   Runtime Environment: Node.js
    
-   Framework: Express.js
    
-   Database: MongoDB with Mongoose ODM
    
-   Caching: Redis
    
-   Authentication: JWT (JSON Web Tokens) with refresh token rotation
    
-   File Storage: Cloudinary
    
-   Payment Processing: Stripe, Razorpay
    
-   Email Service: Nodemailer with Handlebars templates
    
-   Queue Processing: Bull (Redis-based)
    
-   Validation: express-validator
    
-   Security: Helmet, CORS, xss-clean, express-mongo-sanitize, hpp
    
-   Logging: Winston with daily rotation
    
-   Testing: Jest
    

### Frontend Technologies

-   Framework: React
    
-   State Management: Redux Toolkit
    
-   Routing: React Router DOM
    
-   UI Components: Tailwind CSS
    
-   Form Handling: React Hook Form with Yup validation
    
-   HTTP Client: Axios with interceptors
    
-   Animations: Framer Motion
    
-   Payment Integration: Stripe Elements
    
-   Icons: React Icons
    
-   Build Tool: Vite
    

## System Architecture

The application follows a three-tier architecture:

1.  Presentation Layer: React frontend with responsive UI
    
2.  Application Layer: Express.js REST API with modular controllers and services
    
3.  Data Layer: MongoDB for persistent storage, Redis for caching and queues
    

## Project Structure

```
E Commerce/
├─ backend/
│  ├─ scripts/
│  │  ├─ backupDatabase.js
│  │  ├─ cleanupCarts.js
│  │  ├─ createAdmin.js
│  │  ├─ createProducts.js
│  │  ├─ migrateData.js
│  │  ├─ seedCategories.js
│  │  └─ seedDatabase.js
│  ├─ src/
│  │  ├─ config/
│  │  │  ├─ cloudinary.config.js
│  │  │  ├─ db.config.js
│  │  │  ├─ email.config.js
│  │  │  ├─ index.js
│  │  │  ├─ passport.config.js
│  │  │  └─ redis.config.js
│  │  ├─ controllers/
│  │  │  ├─ admin.controller.js
│  │  │  ├─ auth.controller.js
│  │  │  ├─ cart.controller.js
│  │  │  ├─ category.controller.js
│  │  │  ├─ coupon.controller.js
│  │  │  ├─ index.js
│  │  │  ├─ order.controller.js
│  │  │  ├─ payment.controller.js
│  │  │  ├─ product.controller.js
│  │  │  ├─ review.controller.js
│  │  │  └─ user.controller.js
│  │  ├─ docs/
│  │  │  ├─ api.md
│  │  │  └─ swagger.yaml
│  │  ├─ jobs/
│  │  │  ├─ cronJobs/
│  │  │  │  ├─ cleanupExpiredCarts.js
│  │  │  │  ├─ sendOrderReminders.js
│  │  │  │  └─ updateInventory.js
│  │  │  └─ queueJobs/
│  │  │     ├─ emailQueue.js
│  │  │     ├─ imageProcessingQueue.js
│  │  │     └─ orderProcessingQueue.js
│  │  ├─ middleware/
│  │  │  ├─ auth.middleware.js
│  │  │  ├─ cache.middleware.js
│  │  │  ├─ error.middleware.js
│  │  │  ├─ index.js
│  │  │  ├─ logger.middleware.js
│  │  │  ├─ rateLimiter.middleware.js
│  │  │  ├─ upload.middleware.js
│  │  │  └─ validation.middleware.js
│  │  ├─ models/
│  │  │  ├─ Address.model.js
│  │  │  ├─ Cart.model.js
│  │  │  ├─ Category.model.js
│  │  │  ├─ Coupon.model.js
│  │  │  ├─ index.js
│  │  │  ├─ Order.model.js
│  │  │  ├─ Payment.model.js
│  │  │  ├─ Product.model.js
│  │  │  ├─ Review.model.js
│  │  │  └─ User.model.js
│  │  ├─ routes/
│  │  │  ├─ v1/
│  │  │  │  ├─ admin.routes.js
│  │  │  │  ├─ auth.routes.js
│  │  │  │  ├─ cart.routes.js
│  │  │  │  ├─ category.routes.js
│  │  │  │  ├─ coupon.routes.js
│  │  │  │  ├─ index.js
│  │  │  │  ├─ order.routes.js
│  │  │  │  ├─ payment.routes.js
│  │  │  │  ├─ product.routes.js
│  │  │  │  ├─ review.routes.js
│  │  │  │  └─ user.routes.js
│  │  │  └─ index.js
│  │  ├─ services/
│  │  │  ├─ admin.service.js
│  │  │  ├─ auth.service.js
│  │  │  ├─ cart.service.js
│  │  │  ├─ category.service.js
│  │  │  ├─ cloudinary.service.js
│  │  │  ├─ coupon.service.js
│  │  │  ├─ email.service.js
│  │  │  ├─ index.js
│  │  │  ├─ order.service.js
│  │  │  ├─ payment.service.js
│  │  │  ├─ product.service.js
│  │  │  ├─ redis.service.js
│  │  │  ├─ review.service.js
│  │  │  └─ user.service.js
│  │  ├─ sockets/
│  │  │  ├─ notification.socket.js
│  │  │  ├─ order.socket.js
│  │  │  └─ socket.handler.js
│  │  ├─ templates/
│  │  │  ├─ emails/
│  │  │  │  ├─ orderConfirmation.handlebars
│  │  │  │  ├─ orderStatusUpdate.handlebars
│  │  │  │  ├─ resetPassword.handlebars
│  │  │  │  └─ welcomeEmail.handlebars
│  │  │  └─ invoices/
│  │  │     └─ invoiceTemplate.html
│  │  ├─ tests/
│  │  │  ├─ fixtures/
│  │  │  │  └─ data.js
│  │  │  ├─ integration/
│  │  │  │  ├─ auth.test.js
│  │  │  │  ├─ order.test.js
│  │  │  │  └─ product.test.js
│  │  │  ├─ unit/
│  │  │  │  ├─ controllers/
│  │  │  │  │  ├─ .gitkeep
│  │  │  │  │  └─ auth.test.js
│  │  │  │  ├─ models/
│  │  │  │  │  └─ .gitkeep
│  │  │  │  └─ services/
│  │  │  │     └─ .gitkeep
│  │  │  └─ setup.js
│  │  ├─ utils/
│  │  │  ├─ ApiError.js
│  │  │  ├─ ApiResponse.js
│  │  │  ├─ asyncHandler.js
│  │  │  ├─ comparePassword.js
│  │  │  ├─ constants.js
│  │  │  ├─ generateToken.js
│  │  │  ├─ hashPassword.js
│  │  │  ├─ helpers.js
│  │  │  ├─ index.js
│  │  │  ├─ logger.js
│  │  │  └─ sendEmail.js
│  │  ├─ validators/
│  │  │  ├─ auth.validator.js
│  │  │  ├─ cart.validator.js
│  │  │  ├─ index.js
│  │  │  ├─ order.validator.js
│  │  │  ├─ product.validator.js
│  │  │  └─ user.validator.js
│  │  ├─ app.js
│  │  └─ server.js
│  ├─ .dockerignore
│  ├─ .env
│  ├─ .env.example
│  ├─ .eslintrc.js
│  ├─ .gitignore
│  ├─ .prettierrc
│  ├─ docker-compose.yml
│  ├─ Dockerfile
│  ├─ jest.config.js
│  ├─ nodemon.json
│  ├─ package-lock.json
│  ├─ package.json
│  └─ README.md
├─ Frontend/
│  ├─ public/
│  │  └─ images/
│  │     └─ logos/
│  │        └─ logo.svg
│  ├─ src/
│  │  ├─ assets/
│  │  │  ├─ images/
│  │  │  │  ├─ logooo.png
│  │  │  │  ├─ navLogo.png
│  │  │  │  └─ navLogo.svg
│  │  │  └─ styles/
│  │  │     ├─ globals.css
│  │  │     └─ tailwind.css
│  │  ├─ components/
│  │  │  ├─ cart/
│  │  │  │  ├─ CartDrawer.jsx
│  │  │  │  ├─ CartItem.jsx
│  │  │  │  ├─ CartSummary.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ checkout/
│  │  │  │  ├─ CheckoutForm.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ OrderSummary.jsx
│  │  │  │  └─ PaymentForm.jsx
│  │  │  ├─ common/
│  │  │  │  ├─ Button.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ Input.jsx
│  │  │  │  ├─ Loader.jsx
│  │  │  │  ├─ Modal.jsx
│  │  │  │  ├─ ProtectedRoute.jsx
│  │  │  │  └─ Toast.jsx
│  │  │  ├─ layout/
│  │  │  │  ├─ Footer.jsx
│  │  │  │  ├─ Header.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ Layout.jsx
│  │  │  │  ├─ Navbar.jsx
│  │  │  │  └─ Sidebar.jsx
│  │  │  ├─ products/
│  │  │  │  ├─ index.js
│  │  │  │  ├─ ProductCard.jsx
│  │  │  │  ├─ ProductDetails.jsx
│  │  │  │  ├─ ProductFilters.jsx
│  │  │  │  ├─ ProductGrid.jsx
│  │  │  │  ├─ ProductReviews.jsx
│  │  │  │  └─ RelatedProducts.jsx
│  │  │  └─ user/
│  │  │     ├─ AddressForm.jsx
│  │  │     ├─ AddressList.jsx
│  │  │     ├─ ChangePasswordForm.jsx
│  │  │     ├─ index.js
│  │  │     ├─ LoginForm.jsx
│  │  │     ├─ OrderHistory.jsx
│  │  │     ├─ ProfileForm.jsx
│  │  │     └─ RegisterForm.jsx
│  │  ├─ context/
│  │  │  └─ ThemeContext.jsx
│  │  ├─ hooks/
│  │  │  ├─ useAuth.js
│  │  │  ├─ useCart.js
│  │  │  ├─ useDebounce.js
│  │  │  ├─ useLocalStorage.js
│  │  │  ├─ useProducts.js
│  │  │  └─ useWindowSize.js
│  │  ├─ pages/
│  │  │  ├─ admin/
│  │  │  │  ├─ AdminCoupons.jsx
│  │  │  │  ├─ AdminDashboard.jsx
│  │  │  │  ├─ AdminManagement.jsx
│  │  │  │  ├─ AdminOrders.jsx
│  │  │  │  ├─ AdminProducts.jsx
│  │  │  │  ├─ AdminUsers.jsx
│  │  │  │  ├─ CategoryManager.jsx
│  │  │  │  ├─ CategorySelector.jsx
│  │  │  │  ├─ CouponForm.jsx
│  │  │  │  ├─ OrderDetails.jsx
│  │  │  │  ├─ ProductForm.jsx
│  │  │  │  └─ UserDetails.jsx
│  │  │  ├─ AboutPage.jsx
│  │  │  ├─ CartPage.jsx
│  │  │  ├─ CheckoutPage.jsx
│  │  │  ├─ ContactPage.jsx
│  │  │  ├─ HomePage.jsx
│  │  │  ├─ LoginPage.jsx
│  │  │  ├─ NotFoundPage.jsx
│  │  │  ├─ OrderDetailPage.jsx
│  │  │  ├─ OrdersPage.jsx
│  │  │  ├─ ProductPage.jsx
│  │  │  ├─ ProfilePage.jsx
│  │  │  ├─ RegisterPage.jsx
│  │  │  ├─ ShopPage.jsx
│  │  │  └─ WishlistPage.jsx
│  │  ├─ routes/
│  │  │  ├─ AppRoutes.jsx
│  │  │  ├─ PrivateRoute.jsx
│  │  │  └─ PublicRoute.jsx
│  │  ├─ services/
│  │  │  ├─ adminService.js
│  │  │  ├─ api.js
│  │  │  ├─ authService.js
│  │  │  ├─ cartService.js
│  │  │  ├─ categoryService.js
│  │  │  ├─ cloudinaryService.js
│  │  │  ├─ couponService.js
│  │  │  ├─ index.js
│  │  │  ├─ orderService.js
│  │  │  ├─ paymentService.js
│  │  │  ├─ productService.js
│  │  │  ├─ reviewService.js
│  │  │  └─ userService.js
│  │  ├─ store/
│  │  │  ├─ slices/
│  │  │  │  ├─ authSlice.js
│  │  │  │  ├─ cartSlice.js
│  │  │  │  ├─ categorySlice.js
│  │  │  │  ├─ index.js
│  │  │  │  ├─ orderSlice.js
│  │  │  │  ├─ productSlice.js
│  │  │  │  ├─ reviewSlice.js
│  │  │  │  ├─ uiSlice.js
│  │  │  │  └─ userSlice.js
│  │  │  ├─ index.js
│  │  │  └─ store.js
│  │  ├─ utils/
│  │  │  ├─ axiosConfig.js
│  │  │  ├─ constants.js
│  │  │  ├─ errorHandler.js
│  │  │  ├─ formatters.js
│  │  │  ├─ helpers.js
│  │  │  └─ validators.js
│  │  ├─ App.jsx
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ .env
│  ├─ .env.example
│  ├─ .gitignore
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ tailwind.config.js
│  └─ vite.config.js
└─ package.json
```


## Core Features

### User Management

-   User registration and authentication with JWT
    
-   Password reset functionality via email
    
-   Email verification for new accounts
    
-   Profile management and update
    
-   Address book management
    
-   Order history and tracking
    

### Product Management

-   Product catalog with pagination and filtering
    
-   Category-based organization with hierarchical structure
    
-   Product search functionality
    
-   Product reviews and ratings
    
-   Inventory tracking
    
-   Featured products display
    

### Shopping Cart

-   Persistent cart storage with Redis caching
    
-   Cart item management (add, update, remove)
    
-   Coupon code application
    
-   Price calculation and tax estimation
    
-   Cart synchronization across devices
    

### Order Processing

-   Order creation and management
    
-   Order status tracking with timeline
    
-   Invoice generation (PDF)
    
-   Email notifications for order updates
    
-   Order cancellation and return requests
    

### Payment Integration

-   Stripe payment processing
    
-   Cash on Delivery option
    
-   Payment intent creation and confirmation
    
-   Webhook handling for payment events
    
-   Refund processing for administrators
    

### Admin Dashboard

-   Comprehensive analytics and reporting
    
-   Product management (CRUD operations)
    
-   Order management with status updates
    
-   User management with role assignment
    
-   Coupon management
    
-   System logs and cache management
    

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/v1/auth/register | User registration |
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/refresh-token | Refresh JWT token |
| POST | /api/v1/auth/logout | User logout |
| POST | /api/v1/auth/forgot-password | Request password reset |
| POST | /api/v1/auth/reset-password | Reset password with token |
| GET | /api/v1/auth/verify-email/:token | Verify email address |

### Product Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/products | Get all products with filters |
| GET | /api/v1/products/:id | Get product by ID |
| GET | /api/v1/products/slug/:slug | Get product by slug |
| POST | /api/v1/products | Create new product (admin) |
| PUT | /api/v1/products/:id | Update product (admin) |
| DELETE | /api/v1/products/:id | Delete product (admin) |
| GET | /api/v1/products/:id/reviews | Get product reviews |

### Cart Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/cart | Get user cart |
| POST | /api/v1/cart/add | Add item to cart |
| PUT | /api/v1/cart/update | Update cart item quantity |
| DELETE | /api/v1/cart/remove/:productId | Remove item from cart |
| DELETE | /api/v1/cart/clear | Clear entire cart |
| POST | /api/v1/cart/coupon | Apply coupon to cart |
| DELETE | /api/v1/cart/coupon | Remove coupon from cart |

### Order Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/v1/orders | Create new order |
| GET | /api/v1/orders | Get user orders |
| GET | /api/v1/orders/:id | Get order by ID |
| POST | /api/v1/orders/:id/cancel | Cancel order |
| GET | /api/v1/orders/:id/track | Track order status |
| GET | /api/v1/orders/:id/invoice | Download order invoice |

### Category Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/categories | Get all categories |
| GET | /api/v1/categories/tree | Get hierarchical category tree |
| GET | /api/v1/categories/:id | Get category by ID |
| POST | /api/v1/categories | Create new category (admin) |
| PUT | /api/v1/categories/:id | Update category (admin) |
| DELETE | /api/v1/categories/:id | Delete category (admin) |

### Payment Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/v1/payments/create-intent | Create payment intent |
| POST | /api/v1/payments/confirm | Confirm payment |
| GET | /api/v1/payments/methods | Get available payment methods |
| GET | /api/v1/payments/history | Get payment history |
| POST | /api/v1/payments/initiate-cod | Initiate COD payment |
| POST | /api/v1/payments/refund/:orderId | Process refund (admin) |

### Admin Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/v1/admin/dashboard/stats | Get dashboard statistics |
| GET | /api/v1/admin/reports/revenue | Get revenue reports |
| GET | /api/v1/admin/top-products | Get top selling products |
| GET | /api/v1/admin/users | Get all users |
| PUT | /api/v1/admin/users/:id/role | Update user role |
| GET | /api/v1/admin/orders | Get all orders |
| GET | /api/v1/admin/products | Get all products |
| POST | /api/v1/admin/cache/clear | Clear Redis cache |

## Authentication Flow

1.  User registers with email and password
    
2.  Password is hashed using bcrypt before storage
    
3.  Upon login, JWT access token and refresh token are generated
    
4.  Access token expires in 7 days, refresh token in 30 days
    
5.  Refresh token is stored in Redis for invalidation on logout
    
6.  Protected routes verify JWT using Passport.js JWT strategy
    
7.  Token refresh endpoint provides new tokens when access token expires
    

## Database Schema Design

### User Schema

-   name, email, password (hashed)
    
-   role (user, admin, moderator)
    
-   isEmailVerified flag
    
-   addresses array (references Address collection)
    
-   wishlist array (references Product collection)
    
-   preferences object (newsletter, notifications, language, currency)
    

### Product Schema

-   name, slug, description, shortDescription
    
-   price, compareAtPrice, costPerItem
    
-   quantity, soldQuantity
    
-   category reference
    
-   images array with Cloudinary URLs
    
-   tags, attributes, variants
    
-   ratings average and count
    
-   viewCount, purchaseCount
    

### Order Schema

-   orderNumber (auto-generated)
    
-   items array with product snapshots
    
-   subtotal, shippingCost, tax, discount, totalAmount
    
-   status (pending, processing, confirmed, shipped, delivered, cancelled)
    
-   paymentStatus (pending, paid, failed, refunded)
    
-   shippingAddress, billingAddress
    
-   trackingNumber, trackingUrl
    
-   timeline array for order status history
    

## Security Implementation

-   Password hashing with bcrypt (12 salt rounds)
    
-   JWT tokens with expiration
    
-   HTTP-only cookies for refresh tokens (optional)
    
-   Request rate limiting
    
-   NoSQL injection prevention via mongo-sanitize
    
-   XSS protection via xss-clean
    
-   Parameter pollution prevention via hpp
    
-   Helmet.js for security headers
    
-   CORS configuration for specific origins
    
-   Input validation and sanitization
    

## Caching Strategy

-   Redis caching for frequently accessed data
    
-   Category tree cached for 5 minutes
    
-   Product lists cached with query-based keys
    
-   Cart data cached with user-specific keys
    
-   Cache invalidation on data mutations
    
-   Cache patterns cleared using pattern matching
    

## Queue Processing

-   Bull queues for background jobs
    
-   Order processing queue for inventory updates
    
-   Email queue for asynchronous email delivery
    
-   Image processing queue for Cloudinary uploads
    
-   Cron jobs for scheduled tasks (expired cart cleanup, inventory updates)
    

## Error Handling

-   Centralized error handling middleware
    
-   Custom ApiError class for operational errors
    
-   Async handler wrapper to avoid try-catch repetition
    
-   Consistent error response format
    
-   Validation error formatting
    
-   Graceful shutdown on uncaught exceptions
    

## Installation and Setup

### Prerequisites

-   Node.js (version 18 or higher)
    
-   MongoDB (local or Atlas)
    
-   Redis server
    
-   Stripe account for payment processing
    
-   Cloudinary account for image storage
    
-   SMTP server for email (Gmail, SendGrid, etc.)
    

### Environment Variables

Backend (.env):

text

NODE\_ENV=development
PORT=5000
MONGODB\_URI=mongodb://localhost:27017/ecommerce
REDIS\_URL=redis://localhost:6379
JWT\_SECRET=your\_jwt\_secret
JWT\_REFRESH\_SECRET=your\_refresh\_secret
CLOUDINARY\_CLOUD\_NAME=your\_cloud\_name
CLOUDINARY\_API\_KEY=your\_api\_key
CLOUDINARY\_API\_SECRET=your\_api\_secret
STRIPE\_SECRET\_KEY=your\_stripe\_secret\_key
EMAIL\_HOST=smtp.gmail.com
EMAIL\_USER=your\_email@gmail.com
EMAIL\_PASSWORD=your\_app\_password
CLIENT\_URL=http://localhost:3000

Frontend (.env):

text

VITE\_API\_URL=http://localhost:5000/api/v1
VITE\_STRIPE\_PUBLIC\_KEY=your\_stripe\_publishable\_key

### Installation Steps

Backend Setup:

text

cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run seed:categories
npm run seed:products
npm run dev

Frontend Setup:

text

cd frontend
npm install
cp .env.example .env
# Configure environment variables
npm run dev

Docker Setup:

text

docker-compose up -d

## Testing

Run tests:

text

\# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage

## Deployment

### Backend Deployment

-   Set NODE\_ENV to production
    
-   Use process manager like PM2
    
-   Configure proper CORS origins
    
-   Enable HTTPS with SSL certificate
    
-   Set up database indexes for production
    
-   Configure log rotation
    

### Frontend Deployment

-   Build with vite build
    
-   Deploy to static hosting (Netlify, Vercel, AWS S3)
    
-   Configure environment variables for production
    
-   Enable gzip compression
    
-   Set up CDN for static assets
    

## Performance Optimization

-   Database indexing on frequently queried fields
    
-   Redis caching for API responses
    
-   Image optimization with Cloudinary
    
-   Pagination for large data sets
    
-   Debounced search inputs
    
-   Lazy loading for admin routes
    
-   Code splitting with React.lazy
    

## Monitoring and Logging

-   Winston logging with daily rotation
    
-   Morgan HTTP request logging
    
-   Error logging to separate files
    
-   Redis cache hit/miss monitoring
    
-   API response time tracking
    
-   Health check endpoint at /health
    

## Contributing Guidelines

1.  Fork the repository
    
2.  Create a feature branch
    
3.  Write tests for new features
    
4.  Ensure all tests pass
    
5.  Submit pull request for review
    

## License

This project is licensed under the MIT License.

## Support

For technical support or questions, please contact the development team through the project repository or email support at support@shophub.com.

## Version History

-   Version 1.0.0 - Initial release with core e-commerce functionality
    
-   Version 1.1.0 - Added admin dashboard and reporting
    
-   Version 1.2.0 - Integrated payment gateways
    
-   Version 1.3.0 - Added queue processing and caching
    

## Acknowledgments

-   Stripe for payment processing
    
-   Cloudinary for image management
    
-   MongoDB Atlas for database hosting
    
-   Redis for caching infrastructure