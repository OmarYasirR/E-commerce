const passport = require('passport');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      console.log('#####################################')
      console.log('there is no user')
      return next(new ApiError(401, 'Unauthorized access'));
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

const checkOwnership = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[idParam]);
      
      if (!resource) {
        return next(new ApiError(404, 'Resource not found'));
      }
      
      if (resource.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ApiError(403, 'You do not own this resource'));
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const checkAccountStatus = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  if (user.isLocked()) {
    return next(new ApiError(401, 'Account is locked. Please try again later'));
  }
  
  if (!user.isEmailVerified && user.authProvider === 'local') {
    return next(new ApiError(401, 'Please verify your email address first'));
  }
  
  next();
};

const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
  checkAccountStatus,
  optionalAuth
};