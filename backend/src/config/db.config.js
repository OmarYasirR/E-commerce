const mongoose = require('mongoose');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      logger.info('Using existing database connection');
      return;
    }

    const options = {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: process.env.DB_NAME || 'ecommerce'
    };

    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      this.isConnected = true;
      logger.info(`MongoDB connected: ${conn.connection.host}`);

      // Get the database name
      const dbName = mongoose.connection.db.databaseName;
      console.log(`\n📀 Connected to database: ${dbName}\n`);
      
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting database:', error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  isConnectedToDB() {
    return this.isConnected;
  }
}

// Create and export a singleton instance
const dbConfig = new Database();
module.exports = dbConfig;