import api from './api';

const couponService = {
  validateCoupon: async (code, cartTotal = 0) => {
    const response = await api.get(`/coupons/validate/${code}`, { params: { cartTotal } });
    return response.data;
  },
  
  applyCoupon: async (code) => {
    const response = await api.post(`/coupons/apply/${code}`);
    return response.data;
  },
  
  getActiveCoupons: async () => {
    const response = await api.get('/coupons/active');
    return response.data;
  },
  
  getCouponByCode: async (code) => {
    const response = await api.get(`/coupons/code/${code}`);
    return response.data;
  },
};

export default couponService;