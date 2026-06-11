const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('passport');

const { errorHandler } = require('./middleware/error.middleware');
const { httpLogger } = require('./middleware/logger.middleware');
const logger = require('./utils/logger');
const routes = require('./routes');


const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));


// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['price', 'rating', 'category', 'sort']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.http(message.trim()) } }));
  app.use(httpLogger);
}

// Passport initialization
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use(process.env.API_PREFIX || '/api', routes);

const listRoutes = (stack, basePath = '') => {
  stack.forEach(layer => {
    if (layer.route) {
      // Routes registered directly on the app
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Router middleware
      const routerPath = layer.regexp.source
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\?/g, '')
        .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
      listRoutes(layer.handle.stack, `${basePath}${routerPath}`);
    }
  });
};


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global error handler
app.use(errorHandler);     

module.exports = app;