const dbConfig = require('./db.config');
const redisConfig = require('./redis.config');
const cloudinaryConfig = require('./cloudinary.config');
const passport = require('./passport.config');
const emailConfig = require('./email.config');

// Initialize configurations
const initConfigs = async () => {
  try {
    await dbConfig.connect();
    await redisConfig.connect();
    console.log('All configurations initialized successfully');
  } catch (error) {
    console.error('Error initializing configurations:', error);
    throw error;
  }
};

module.exports = {
  dbConfig,
  redisConfig,
  cloudinaryConfig,
  passport,
  emailConfig,
  initConfigs
};