const logger = require('../utils/logger');

const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

const requestLogger = (req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  logger.debug('Request Body:', req.body);
  next();
};

const errorLogger = (err, req, res, next) => {
  logger.error(`${err.statusCode || 500} - ${err.message}`);
  next(err);
};

module.exports = {
  httpLogger,
  requestLogger,
  errorLogger
};