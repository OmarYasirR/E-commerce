const redisConfig = require('../config/redis.config');

class RedisService {
  async get(key) {
    return await redisConfig.get(key);
  }
  
  async set(key, value, ttl = 3600) {
    return await redisConfig.set(key, value, ttl);
  }
  
  async del(key) {
    return await redisConfig.del(key);
  }
  
  async delPattern(pattern) {
    const client = await redisConfig.connect();
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
  
  async flush() {
    return await redisConfig.flush();
  }
  
  async exists(key) {
    const client = await redisConfig.connect();
    return await client.exists(key);
  }
  
  async expire(key, seconds) {
    const client = await redisConfig.connect();
    return await client.expire(key, seconds);
  }
  
  async incr(key) {
    const client = await redisConfig.connect();
    return await client.incr(key);
  }
  
  async hset(key, field, value) {
    const client = await redisConfig.connect();
    return await client.hSet(key, field, JSON.stringify(value));
  }
  
  async hget(key, field) {
    const client = await redisConfig.connect();
    const value = await client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  }
  
  async hdel(key, field) {
    const client = await redisConfig.connect();
    return await client.hDel(key, field);
  }
  
  async hgetall(key) {
    const client = await redisConfig.connect();
    const data = await client.hGetAll(key);
    const parsed = {};
    for (const [field, value] of Object.entries(data)) {
      parsed[field] = JSON.parse(value);
    }
    return parsed;
  }
}

module.exports = new RedisService();