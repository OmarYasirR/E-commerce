import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  // Addresses
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data;
  },
  
  createAddress: async (addressData) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  },
  
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  },
  
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  },
  
  setDefaultAddress: async (addressId) => {
    const response = await api.put(`/users/addresses/${addressId}/default`);
    return response.data;
  },
  
  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/users/wishlist');
    return response.data;
  },
  
  addToWishlist: async (productId) => {
    const response = await api.post(`/users/wishlist/${productId}`);
    return response.data;
  },
  
  removeFromWishlist: async (productId) => {
    const response = await  api.delete(`/users/wishlist/${productId}`);
    return response.data;
  },
  
  // Orders
  getUserOrders: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/users/orders', { params });
    return response.data;
  },
  
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/users/orders/${orderId}`);
    return response.data;
  },
  
  // Stats
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
  
  // Avatar
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export default userService;