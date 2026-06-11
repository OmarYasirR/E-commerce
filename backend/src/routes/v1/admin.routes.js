const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  validate
];

const roleValidation = [
  body('role').isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
  validate
];

const suspendValidation = [
  body('reason').optional().isString(),
  body('days').optional().isInt({ min: 1, max: 365 }),
  validate
];

router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/sales', adminController.getSalesReport);
router.get('/top-products', adminController.getTopProducts);
router.get('/top-customers', adminController.getTopCustomers);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', idValidation, adminController.getUserDetails);
router.put('/users/:id/role', idValidation, roleValidation, adminController.updateUserRole);
router.post('/users/:id/suspend', idValidation, suspendValidation, adminController.suspendUser);
router.post('/users/:id/activate', idValidation, adminController.activateUser);

// Order management
router.get('/orders', adminController.getAllOrders);

// Product management
router.get('/products', adminController.getAllProducts);
router.post('/products/bulk-update', adminController.bulkUpdateProducts);

// System
router.get('/logs', adminController.getSystemLogs);
router.post('/backup', adminController.backupDatabase);
router.get('/cache/stats', adminController.getCacheStats);
router.post('/cache/clear', adminController.clearCache);

// Admin role management
router.post('/users/:userId/make-admin', 
  authorize('admin'), 
  adminController.grantAdminRole
);  

router.post('/users/:userId/remove-admin', 
  authorize('admin'), 
  adminController.revokeAdminRole
);

router.get('/admins', 
  authorize('admin'), 
  adminController.getAllAdmins
);

router.put('/users/:userId/permissions', 
  authorize('admin'), 
  adminController.updateAdminPermissions
);

router.post('/create-admin', 
  authorize('admin'), 
  adminController.createAdminUser
);

module.exports = router;