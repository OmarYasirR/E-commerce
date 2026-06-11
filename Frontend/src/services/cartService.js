import api from './api';

const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  addToCart: async (productId, quantity = 1, variant = null) => {
    const response = await api.post('/cart/add', { productId, quantity, variant });
    console.log(response)
    return response.data;
  },
  
  updateCartItem: async (productId, quantity, variant = null) => {
    const response = await api.put('/cart/update', { productId, quantity, variant });
    return response.data;
  },
  
  removeFromCart: async (productId, variant = null) => {
    console.log('Removing from cart:', productId, 'Variant:', variant);
    const response = await api.delete(`/cart/remove/${productId}`, { data: { variant } });
    console.log(response.data)
    return response.data;
  },
  
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
  
  applyCoupon: async (couponCode) => {
    const response = await api.post('/cart/coupon', { couponCode });
    return response.data;
  },
  
  removeCoupon: async () => {
    const response = await api.delete('/cart/coupon');
    return response.data;
  },
  
  getCartSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  },
  
  mergeCart: async (items) => {
    const response = await api.post('/cart/merge', { items });
    return response.data;
  },
};

export default cartService;