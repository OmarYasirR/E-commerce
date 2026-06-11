const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidator = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

const forgotPasswordValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
];

const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
};