const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Short description cannot exceed 200 characters'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Compare at price must be a positive number'),
  
  body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  
  body('category')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft']).withMessage('Invalid product status'),
  
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString().trim()
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 }),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft']),
  
  body('isFeatured')
    .optional()
    .isBoolean()
];

const productIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid product ID format')
];

const productQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  query('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  productQueryValidator
};