const rateLimit = require('express-rate-limit');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisConfig = require('../config/redis.config');

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.'
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests, please slow down.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

const createRedisLimiter = async (key, points, duration) => {
  const client = await redisConfig.connect();
  
  const limiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: `rl_${key}`,
    points,
    duration
  });
  
  return async (req, res, next) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch (error) {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    }
  };
};

module.exports = {
  standardLimiter,
  authLimiter,
  apiLimiter,
  loginLimiter,
  createRedisLimiter
};