const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { upload } = require('../../middleware/upload.middleware');

const updateProfileValidation = [
  body('name').optional().isLength({ min: 2, max: 50 }),
  body('phoneNumber').optional().matches(/^\+?[\d\s-]{10,}$/),
  validate
];

const addressValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('addressLine1').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('postalCode').notEmpty().withMessage('Postal code is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  validate
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);

router.get('/addresses', userController.getAddresses);
router.post('/addresses', addressValidation, userController.addAddress);
router.put('/addresses/:addressId', addressValidation, userController.updateAddress);
router.delete('/addresses/:addressId', idValidation, userController.deleteAddress);
router.put('/addresses/:addressId/default', idValidation, userController.setDefaultAddress);

router.get('/wishlist', userController.getWishlist);
router.post('/wishlist/:productId', idValidation, userController.addToWishlist);
router.delete('/wishlist/:productId', idValidation, userController.removeFromWishlist);

router.get('/orders', userController.getOrders);
router.get('/orders/:orderId', idValidation, userController.getOrderDetails);

router.get('/stats', userController.getStats);

module.exports = router;