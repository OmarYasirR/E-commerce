const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const reviewController = require('../../controllers/review.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { upload } = require('../../middleware/upload.middleware');

const createReviewValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Review comment is required'),
  validate
];

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().notEmpty(),
  validate
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  validate
];

const reportValidation = [
  body('reason').notEmpty().withMessage('Report reason is required'),
  validate
];

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/stats', reviewController.getReviewStats);
router.get('/:id', idValidation, reviewController.getReviewById);

// User routes
router.use(authenticate);

router.post('/', upload.array('images', 5), createReviewValidation, reviewController.createReview);
router.put('/:id', idValidation, updateReviewValidation, reviewController.updateReview);
router.delete('/:id', idValidation, reviewController.deleteReview);
router.post('/:id/helpful', idValidation, reviewController.markHelpful);
router.post('/:id/report', idValidation, reportValidation, reviewController.reportReview);
router.get('/my/reviews', reviewController.getMyReviews);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), reviewController.getAllReviews);
router.post('/admin/:id/approve', authenticate, authorize('admin'), idValidation, reviewController.approveReview);
router.post('/admin/:id/reject', authenticate, authorize('admin'), idValidation, reviewController.rejectReview);

module.exports = router;