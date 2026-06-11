const express = require('express');
const router = express.Router();
const v1Routes = require('./v1');

const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = process.env.API_PREFIX || '/api';

router.use(`/${API_VERSION}`, v1Routes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: API_VERSION
  });
});

module.exports = router;