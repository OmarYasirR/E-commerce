import api from './api';

const paymentService = {
  createPaymentIntent: async (orderId, paymentMethod = 'stripe') => {
    const response = await api.post('/payments/create-intent', { orderId, paymentMethod });
    return response.data;
  },
  
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    const response = await api.post('/payments/confirm', { paymentIntentId, paymentMethodId });
    return response.data;
  },
  
  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },
  
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },
  
  getPaymentHistory: async (page = 1, limit = 10) => {
    const response = await api.get('/payments/history', { params: { page, limit } });
    return response.data;
  },
  
  initiateCOD: async (orderId) => {
    const response = await api.post('/payments/initiate-cod', { orderId });
    return response.data;
  },
  
  verifyRazorpayPayment: async (orderId, paymentId, signature) => {
    const response = await api.post('/payments/verify-razorpay', { orderId, paymentId, signature });
    return response.data;
  },
};

export default paymentService;