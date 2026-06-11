import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ page = 1, limit = 12, category, minPrice, maxPrice, rating, search, sort = '-createdAt' } = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts({ 
        page, limit, category, minPrice, maxPrice, rating, search, sort 
      });
      // Backend returns: { success, data: { products, pagination } }
      if (response.success && response.data) {
        console.log(response.data);
        return response.data || [];
      }
      return rejectWithValue(response.message || 'Failed to fetch products');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    } 
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch product');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await productService.getProductBySlug(slug);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch product');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelated',
  async ({ productId, limit = 4 }, { rejectWithValue }) => {
    try {
      const response = await productService.getRelatedProducts(productId, limit);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch related products');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch related products');
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  relatedProducts: [],
  loading: false,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  error: null,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    rating: null,
    search: null,
    sort: '-createdAt',
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetProductFilters: (state) => {
      state.filters = {
        category: null,
        minPrice: null,
        maxPrice: null,
        rating: null,
        search: null,
        sort: '-createdAt',
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        console.log('Products fetched:', state.products);
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          pages: 1,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product By Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Related Products
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload;
      });
  },
});

export const { 
  clearProductError, 
  setProductFilters, 
  resetProductFilters, 
  clearCurrentProduct 
} = productSlice.actions;
export default productSlice.reducer;