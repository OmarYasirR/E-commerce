const { body, param } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
  
  body('preferences.newsletter')
    .optional()
    .isBoolean().withMessage('Newsletter preference must be a boolean'),
  
  body('preferences.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh']).withMessage('Invalid language selection')
];

const addressValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Full name cannot exceed 100 characters'),
  
  body('addressLine1')
    .trim()
    .notEmpty().withMessage('Address line 1 is required')
    .isLength({ max: 200 }).withMessage('Address line 1 cannot exceed 200 characters'),
  
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address line 2 cannot exceed 200 characters'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ max: 50 }).withMessage('City cannot exceed 50 characters'),
  
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('postalCode')
    .trim()
    .notEmpty().withMessage('Postal code is required')
    .matches(/^[A-Za-z0-9\s-]{3,10}$/).withMessage('Please provide a valid postal code'),
  
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
  
  body('addressType')
    .optional()
    .isIn(['shipping', 'billing', 'both']).withMessage('Invalid address type'),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean')
];

const idParamValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

const addressIdParamValidator = [
  param('addressId')
    .isMongoId().withMessage('Invalid address ID format')
];

const productIdParamValidator = [
  param('productId')
    .isMongoId().withMessage('Invalid product ID format')
];

const orderIdParamValidator = [
  param('orderId')
    .isMongoId().withMessage('Invalid order ID format')
];

module.exports = {
  updateProfileValidator,
  addressValidator,
  idParamValidator,
  addressIdParamValidator,
  productIdParamValidator,
  orderIdParamValidator
};