import api from './api';

const productService = {
  getProducts: async ({ 
    page = 1, 
    limit = 12, 
    category, 
    minPrice, 
    maxPrice, 
    rating, 
    search, 
    sort = '-createdAt',
    tag,
    status = 'active'
  } = {}) => {
    const params = { 
      page, 
      limit, 
      sort,
      ...(category && { category }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(rating && { rating }),
      ...(search && { search }),
      ...(tag && { tag }),
      ...(status && { status })
    };
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    console.log(response)
    return response.data;
  },
  
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },
  
  getRelatedProducts: async (productId, limit = 4) => {
    const response = await api.get(`/products/${productId}/related`, { params: { limit } });
    return response.data;
  },
  
  getProductReviews: async (productId, { page = 1, limit = 10, rating = null, sort = '-createdAt' }) => {
    const params = { page, limit, sort };
    if (rating) params.rating = rating;
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  // Upload product images
  uploadProductImages: async (id, formData) => {
    try {
      const response = await api.post(`/products/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload images:', error);
      throw error;
    }
  },

  // Delete product image
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  // Search products
  searchProducts: async (query, limit = 20) => {
    const response = await api.get('/products/search', { params: { q: query, limit } });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, { page = 1, limit = 12, sort = '-createdAt' }) => {
    const response = await api.get(`/products/category/${categoryId}`, {
      params: { page, limit, sort }
    });
    return response.data;
  },

  // Bulk update products (admin)
  bulkUpdateProducts: async (productIds, updateData) => {
    const response = await api.put('/products/bulk', { productIds, ...updateData });
    return response.data;
  },

  // Bulk delete products (admin)
  bulkDeleteProducts: async (productIds) => {
    const response = await api.delete('/products/bulk', { data: { productIds } });
    return response.data;
  },

  // Get product statistics (admin)
  getProductStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },

  // Update product stock
  updateStock: async (id, quantity) => {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  // Toggle product status (active/inactive)
  toggleProductStatus: async (id) => {
    const response = await api.patch(`/products/${id}/toggle-status`);
    return response.data;
  }
};

export default productService;