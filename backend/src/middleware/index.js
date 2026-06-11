module.exports = {
  authMiddleware: require('./auth.middleware'),
  errorMiddleware: require('./error.middleware'),
  validationMiddleware: require('./validation.middleware'),
  uploadMiddleware: require('./upload.middleware'),
  rateLimiterMiddleware: require('./rateLimiter.middleware'),
  cacheMiddleware: require('./cache.middleware'),
  loggerMiddleware: require('./logger.middleware')
};