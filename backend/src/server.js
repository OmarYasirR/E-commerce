require('dotenv').config();
require('./jobs/queueJobs/orderProcessor');
const app = require('./app');
const logger = require('./utils/logger');
const { dbConfig, redisConfig, initConfigs } = require('./config');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try { 
    // Initialize all configurations
    await initConfigs();  

      const listRoutes = (stack, basePath = '') => {
        stack.forEach(layer => {
          if (layer.route) {
            // Routes registered directly on the app
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`${methods} ${basePath}${layer.route.path}`);
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

      // // After app is configured, but before starting server
      // console.log('\n📋 Registered Routes:');
      // console.log('═'.repeat(60));
      // if (app._router && app._router.stack) {
      //   listRoutes(app._router.stack);
      // }
      // console.log('═'.repeat(60));
          
    // Start server
    server = app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✓ API URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}/${process.env.API_VERSION || 'v1'}`);
      logger.info(`✓ Health check: http://localhost:${PORT}/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing connections...');
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        await dbConfig.disconnect();
        await redisConfig.disconnect();
        logger.info('All connections closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing connections:', error);
        process.exit(1);
      }
    });
    
    // Force close after timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcing shutdown');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle process signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start the server
startServer();