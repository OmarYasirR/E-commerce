const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { loginLimiter } = require('../../middleware/rateLimiter.middleware');

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  validate
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.post('/change-password', authenticate, changePasswordValidation, authController.changePassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

module.exports = router;