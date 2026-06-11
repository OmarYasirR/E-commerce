const redisService = require('../services/redis.service');

const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedData = await redisService.get(key);
      
      if (cachedData) {
        return res.json(cachedData);
      }
      
      res.originalJson = res.json;
      res.json = (data) => {
        res.originalJson(data);
        redisService.set(key, data, duration);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

const clearCache = async (pattern) => {
  await redisService.delPattern(pattern);
};

module.exports = {
  cache,
  clearCache
};