const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { upload } = require('../../middleware/upload.middleware');
const { cache } = require('../../middleware/cache.middleware');

const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  validate
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate
];

// Public routes
router.get('/', cache(3600), categoryController.getAllCategories);
router.get('/tree', cache(3600), categoryController.getCategoryTree);
router.get('/:id', idValidation, cache(3600), categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id/products', idValidation, categoryController.getCategoryProducts);

// Admin routes
router.post('/', authenticate, authorize('admin'), upload.single('image'), categoryValidation, categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), idValidation, upload.single('image'), categoryValidation, categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), idValidation, categoryController.deleteCategory);
router.put('/order', authenticate, authorize('admin'), categoryController.updateCategoryOrder);

module.exports = router;