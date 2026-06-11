import api from './api';

const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  
  getRevenueReport: async ({ period = 'week', startDate, endDate }) => {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/admin/reports/revenue', { params });
    return response.data;
  },
  
  getSalesReport: async ({ startDate, endDate, category, product }) => {
    const params = { startDate, endDate, category, product };
    const response = await api.get('/admin/reports/sales', { params });
    return response.data;
  },
  
  getTopProducts: async ({ limit = 10, period = 'month' }) => {
    const response = await api.get('/admin/top-products', { params: { limit, period } });
    return response.data;
  },
  
  getTopCustomers: async ({ limit = 10, period = 'year' }) => {
    const response = await api.get('/admin/top-customers', { params: { limit, period } });
    return response.data;
  },
  
  // User Management
  getAllUsers: async ({ page = 1, limit = 20, role, search, sort = '-createdAt' }) => {
    const params = { page, limit, sort };
    if (role) params.role = role;
    if (search) params.search = search;
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  suspendUser: async (userId, reason, days = 30) => {
    const response = await api.post(`/admin/users/${userId}/suspend`, { reason, days });
    return response.data;
  },
  
  activateUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/activate`);
    return response.data;
  },
  
  // Order Management
  getAllOrders: async ({ page = 1, limit = 20, status, paymentStatus, startDate, endDate, search }) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search) params.search = search;
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
  
  updateOrderStatus: async (orderId, status, description = '') => {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status, description });
    return response.data;
  },
  
  // Product Management
  getAllProducts: async ({ page = 1, limit = 20, status, category, lowStock, search }) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (category) params.category = category;
    if (lowStock) params.lowStock = lowStock;
    if (search) params.search = search;
    const response = await api.get('/admin/products', { params });
    return response.data;
  },
  
  bulkUpdateProducts: async (productIds, updateData) => {
    const response = await api.post('/admin/products/bulk-update', { productIds, updateData });
    return response.data;
  },
  
  bulkDeleteProducts: async (productIds) => {
    const response = await api.post('/admin/products/bulk-delete', { productIds });
    return response.data;
  },
  
  deleteProduct: async (productId) => {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },
  
  exportProducts: async () => {
    const response = await api.get('/admin/products/export', { responseType: 'blob' });
    return response;
  },
  
  // Coupon Management
  getAllCoupons: async ({ page = 1, limit = 20, status, search }) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get('/admin/coupons', { params });
    return response.data;
  },
  
  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  },
  
  updateCoupon: async (couponId, couponData) => {
    const response = await api.put(`/admin/coupons/${couponId}`, couponData);
    return response.data;
  },
  
  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/admin/coupons/${couponId}`);
    return response.data;
  },
  
  toggleCouponStatus: async (couponId) => {
    const response = await api.post(`/admin/coupons/${couponId}/toggle`);
    return response.data;
  },
  
  // System
  getSystemLogs: async ({ level = 'info', limit = 100, startDate, endDate }) => {
    const params = { level, limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/admin/logs', { params });
    return response.data;
  },
  
  backupDatabase: async () => {
    const response = await api.post('/admin/backup');
    return response.data;
  },
  
  clearCache: async (pattern = '*') => {
    const response = await api.post('/admin/cache/clear', { pattern });
    return response.data;
  },
  
  getCacheStats: async () => {
    const response = await api.get('/admin/cache/stats');
    return response.data;
  },
  
  getAnalytics: async ({ type = 'overview', period = 'month' }) => {
    const response = await api.get('/admin/analytics', { params: { type, period } });
    return response.data;
  },
  
  exportOrders: async ({ status, startDate, endDate }) => {
    const params = { status, startDate, endDate };
    const response = await api.get('/admin/orders/export', { params, responseType: 'blob' });
    return response;
  }
};

export default adminService;