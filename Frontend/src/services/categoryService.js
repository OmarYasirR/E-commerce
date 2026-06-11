import api from './api';

const categoryService = {
  // Get all categories with cache busting
  getCategories: async ({ includeProducts = false, status = 'active' } = {}) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await api.get('/categories', { 
        params: { 
          includeProducts, 
          status,
          _t: timestamp // Cache buster
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  // Get category tree with cache busting
  getCategoryTree: async () => {
    try {
      const timestamp = Date.now();
      const response = await api.get('/categories/tree', {
        params: { _t: timestamp },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      throw error;
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    try {
      const response = await api.get(`/categories/slug/${slug}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch category by slug:', error);
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      // Clear browser cache after mutation
      await clearBrowserCache();
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      await clearBrowserCache();
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id, moveProductsTo = null) => {
    try {
      const response = await api.delete(`/categories/${id}`, {
        data: { moveProductsTo }
      });
      await clearBrowserCache();
      return response.data;
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  },

  // Get products in category
  getCategoryProducts: async (id, { page = 1, limit = 20, sort = '-createdAt' } = {}) => {
    try {
      const response = await api.get(`/categories/${id}/products`, {
        params: { page, limit, sort }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch category products:', error);
      throw error;
    }
  },

  // Update category order
  updateCategoryOrder: async (orders) => {
    try {
      const response = await api.put('/categories/order', { orders });
      await clearBrowserCache();
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to update category order:', error);
      throw error;
    }
  },

  // Toggle category status
  toggleCategoryStatus: async (id) => {
    try {
      const response = await api.post(`/categories/${id}/toggle`);
      await clearBrowserCache();
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      throw error;
    }
  },

  // Force refresh - clear all caches and fetch fresh data
  refreshCategories: async () => {
    await clearBrowserCache();
    return categoryService.getCategories({ includeProducts: true });
  }
};

// Helper function to clear browser cache
const clearBrowserCache = async () => {
  // Clear localStorage/sessionStorage
  localStorage.removeItem('categories_cache');
  sessionStorage.removeItem('categories_cache');
  
  // Clear all category-related items from localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('category') || key.includes('categories')) {
      localStorage.removeItem(key);
    }
  });
  
  // Dispatch event to notify all components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('categories-changed', { 
      detail: { timestamp: Date.now() } 
    }));
  }
  
  console.log('Browser cache cleared');
};

export default categoryService;