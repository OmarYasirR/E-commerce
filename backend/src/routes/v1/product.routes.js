const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { upload } = require('../../middleware/upload.middleware');
const { cache } = require('../../middleware/cache.middleware');

const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
  body('category').isMongoId().withMessage('Invalid category ID'),
  validate
];

const updateProductValidation = [
  body('name').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('quantity').optional().isInt({ min: 0 }),
  validate
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  validate
];

// Public routes
router.get('/', cache(300), productController.getAllProducts);
router.get('/stats', authenticate, authorize('admin'), productController.getProductStats);
router.get('/:id', idValidation, cache(600), productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/reviews', idValidation, productController.getProductReviews);
router.get('/:id/related', idValidation, productController.getRelatedProducts);

// Admin routes
router.post('/', authenticate, authorize('admin'), upload.array('images', 5), productValidation, productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), idValidation, updateProductValidation, productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), idValidation, productController.deleteProduct);
router.post('/:id/images', authenticate, authorize('admin'), idValidation, upload.array('images', 5), productController.uploadProductImages);
router.delete('/:id/images/:imageId', authenticate, authorize('admin'), productController.deleteProductImage);

module.exports = router;