const redis = require('redis');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && this.client) {
      logger.info('Using existing Redis connection');
      return this.client;
    }

    const redisConfig = {
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };

    this.client = redis.createClient(redisConfig);

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
      this.isConnected = true;
    });

    try {
      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) await this.connect();
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected) await this.connect();
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis set error for key ${key}:`, error);
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) await this.connect();
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis del error for key ${key}:`, error);
    }
  }

  async delPattern(pattern) {
    try {
      if (!this.isConnected) await this.connect();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error(`Redis delPattern error for pattern ${pattern}:`, error);
    }
  }

  async flush() {
    try {
      if (!this.isConnected) await this.connect();
      await this.client.flushAll();
      logger.info('Redis cache flushed');
    } catch (error) {
      logger.error('Redis flush error:', error);
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) await this.connect();
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis exists error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.isConnected) await this.connect();
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis expire error for key ${key}:`, error);
      return false;
    }
  }

  async incr(key) {
    try {
      if (!this.isConnected) await this.connect();
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis incr error for key ${key}:`, error);
      return 0;
    }
  }

  async hset(key, field, value) {
    try {
      if (!this.isConnected) await this.connect();
      return await this.client.hSet(key, field, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis hset error for key ${key}:`, error);
      return 0;
    }
  }

  async hget(key, field) {
    try {
      if (!this.isConnected) await this.connect();
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis hget error for key ${key}:`, error);
      return null;
    }
  }

  async hdel(key, field) {
    try {
      if (!this.isConnected) await this.connect();
      return await this.client.hDel(key, field);
    } catch (error) {
      logger.error(`Redis hdel error for key ${key}:`, error);
      return 0;
    }
  }

  async hgetall(key) {
    try {
      if (!this.isConnected) await this.connect();
      const data = await this.client.hGetAll(key);
      const parsed = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value;
        }
      }
      return parsed;
    } catch (error) {
      logger.error(`Redis hgetall error for key ${key}:`, error);
      return {};
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis disconnected');
      } catch (error) {
        logger.error('Error disconnecting Redis:', error);
      }
    }
  }
}

// Create and export a singleton instance
const redisConfig = new RedisClient();
module.exports = redisConfig;