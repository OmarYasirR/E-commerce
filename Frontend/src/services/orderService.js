import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getUserOrders: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getOrderByNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },
  
  cancelOrder: async (id, reason = '') => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
  
  trackOrder: async (id) => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  },
  
  getOrderTimeline: async (id) => {
    const response = await api.get(`/orders/${id}/timeline`);
    return response.data;
  },
  
  requestReturn: async (id, reason, description) => {
    const response = await api.post(`/orders/${id}/return`, { reason, description });
    return response.data;
  },
  
  downloadInvoice: async (id) => {
    const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
    return response.data;
  },
  
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

export default orderService;