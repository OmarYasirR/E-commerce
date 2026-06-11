const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const adminService = require('../services/admin.service');
const userService = require('../services/user.service');
const productService = require('../services/product.service');
const orderService = require('../services/order.service');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');



const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved'));
}); 

const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  const report = await adminService.getRevenueReport({
    startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: endDate ? new Date(endDate) : new Date(),
    groupBy
  });
  
  res.status(200).json(new ApiResponse(200, report, 'Revenue report generated'));
});

const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, category, product } = req.query;
  
  const report = await adminService.getSalesReport({
    startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: endDate ? new Date(endDate) : new Date(),
    category,
    product
  });
  
  res.status(200).json(new ApiResponse(200, report, 'Sales report generated'));
});

const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 10, period = 'month' } = req.query;
  
  const products = await adminService.getTopProducts({
    limit: parseInt(limit),
    period
  });
  
  res.status(200).json(new ApiResponse(200, products, 'Top products retrieved'));
});

const getTopCustomers = asyncHandler(async (req, res) => {
  const { limit = 10, period = 'year' } = req.query;
  
  const customers = await adminService.getTopCustomers({
    limit: parseInt(limit),
    period
  });
  
  res.status(200).json(new ApiResponse(200, customers, 'Top customers retrieved'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, sort = '-createdAt' } = req.query;
  
  const users = await adminService.getAllUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    role,
    search,
    sort
  });
  
  res.status(200).json(new ApiResponse(200, users, 'Users retrieved'));
});

const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await userService.getUserById(id);
  
  res.status(200).json(new ApiResponse(200, user, 'User details retrieved'));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await adminService.updateUserRole(id, role);
  
  res.status(200).json(new ApiResponse(200, user, 'User role updated'));
});

const suspendUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, days = 30 } = req.body;
  
  const user = await adminService.suspendUser(id, reason, days);
  
  res.status(200).json(new ApiResponse(200, user, 'User suspended'));
});

const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await adminService.activateUser(id);
  
  res.status(200).json(new ApiResponse(200, user, 'User activated'));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, startDate, endDate } = req.query;
  
  const orders = await adminService.getAllOrders({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    paymentStatus,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  });
  
  res.status(200).json(new ApiResponse(200, orders, 'Orders retrieved'));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, category, lowStock } = req.query;
  
  const products = await adminService.getAllProducts({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    category,
    lowStock: lowStock === 'true'
  });
  
  res.status(200).json(new ApiResponse(200, products, 'Products retrieved'));
});

const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updateData } = req.body;
  
  const products = await adminService.bulkUpdateProducts(productIds, updateData);
  
  res.status(200).json(new ApiResponse(200, products, 'Products updated successfully'));
});

const getSystemLogs = asyncHandler(async (req, res) => {
  const { level = 'info', limit = 100, startDate, endDate } = req.query;
  
  const logs = await adminService.getSystemLogs({
    level,
    limit: parseInt(limit),
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  });
  
  res.status(200).json(new ApiResponse(200, logs, 'System logs retrieved'));
});

const backupDatabase = asyncHandler(async (req, res) => {
  const backup = await adminService.backupDatabase();
  
  res.status(200).json(new ApiResponse(200, backup, 'Database backup created'));
});

const getCacheStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getCacheStats();
  
  res.status(200).json(new ApiResponse(200, stats, 'Cache stats retrieved'));
});

const clearCache = asyncHandler(async (req, res) => {
  const { pattern } = req.body;
  
  await adminService.clearCache(pattern);
  
  res.status(200).json(new ApiResponse(200, null, 'Cache cleared successfully'));
});

const getAnalytics = asyncHandler(async (req, res) => {
  const { type = 'overview', period = 'month' } = req.query;
  
  const analytics = await adminService.getAnalytics({ type, period });
  
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics retrieved'));
});


// Grant admin role to a user
const grantAdminRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role = 'admin', permissions = [] } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Check if already admin
  if (user.role === 'admin') {
    throw new ApiError(400, 'User is already an admin');
  }
  
  // Update user role
  user.role = role;
  user.isAdmin = true;
  user.adminSince = new Date();
  user.createdBy = req.user._id;
  if (permissions.length > 0) {
    user.permissions = permissions;
  }
  
  await user.save();
  
  res.status(200).json(new ApiResponse(200, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      adminSince: user.adminSince
    }
  }, 'Admin role granted successfully'));
});

// Revoke admin role
const revokeAdminRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Prevent self-removal
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot remove your own admin privileges');
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  user.role = 'user';
  user.isAdmin = false;
  user.adminSince = undefined;
  user.permissions = [];
  
  await user.save();
  
  res.status(200).json(new ApiResponse(200, null, 'Admin role revoked successfully'));
});

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ 
    $or: [{ role: 'admin' }, { isAdmin: true }]
  }).select('-password');
  
  res.status(200).json(new ApiResponse(200, admins, 'Admins retrieved successfully'));
});

// Update admin permissions
const updateAdminPermissions = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { permissions } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  if (user.role !== 'admin') {
    throw new ApiError(400, 'User is not an admin');
  }
  
  user.permissions = permissions;
  await user.save();
  
  res.status(200).json(new ApiResponse(200, user.permissions, 'Permissions updated successfully'));
});

// Create admin user directly (super admin only)
const createAdminUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }
  
  const user = new User({
    name,
    email,
    password,
    role: 'admin',
    isAdmin: true,
    adminSince: new Date(),
    createdBy: req.user._id,
    isEmailVerified: true // Auto-verify for admin users
  });
  
  await user.save();
  
  res.status(201).json(new ApiResponse(201, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }, 'Admin user created successfully'));
})



module.exports = {
  getDashboardStats,
  getRevenueReport,
  getSalesReport,
  getTopProducts,
  getTopCustomers,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  suspendUser,
  activateUser,
  getAllOrders,
  getAllProducts,
  bulkUpdateProducts,
  getSystemLogs,
  backupDatabase,
  getCacheStats,
  clearCache,
  getAnalytics,
  grantAdminRole,
  revokeAdminRole,
  getAllAdmins,
  updateAdminPermissions,
  createAdminUser
};