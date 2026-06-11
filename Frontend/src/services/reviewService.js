import api from './api';

const reviewService = {
  getProductReviews: async (productId, { page = 1, limit = 10, rating = null, sort = '-createdAt' }) => {
    const params = { page, limit, sort };
    if (rating) params.rating = rating;
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },
  
  getReviewById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  
  createReview: async ({ productId, rating, title, comment, pros, cons, images }) => {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('rating', rating);
    if (title) formData.append('title', title);
    formData.append('comment', comment);
    if (pros) formData.append('pros', JSON.stringify(pros));
    if (cons) formData.append('cons', JSON.stringify(cons));
    if (images) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  updateReview: async (reviewId, { rating, title, comment, pros, cons }) => {
    const response = await api.put(`/reviews/${reviewId}`, { rating, title, comment, pros, cons });
    return response.data;
  },
  
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
  
  markHelpful: async (reviewId, helpful = true) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`, { helpful });
    return response.data;
  },
  
  reportReview: async (reviewId, reason) => {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },
  
  getMyReviews: async (page = 1, limit = 10) => {
    const response = await api.get('/reviews/my/reviews', { params: { page, limit } });
    return response.data;
  },
  
  getReviewStats: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },
};

export default reviewService;