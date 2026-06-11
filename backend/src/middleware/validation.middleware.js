const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    throw new ApiError(400, 'Validation Error', formattedErrors);
  }
  
  next();
};

const validateParams = (req, res, next) => {
  const id = req.params.id;
  
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, 'Invalid ID format');
  }
  
  next();
};

const sanitizeBody = (req, res, next) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  req.body = sanitized;
  next();
};

module.exports = {
  validate,
  validateParams,
  sanitizeBody
};