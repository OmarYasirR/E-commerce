import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async ({ includeProducts = false, status = 'active' } = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories({ includeProducts, status });
      // Backend returns: { success, data: categories[] }
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch categories');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryTree = createAsyncThunk(
  'categories/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryTree();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch category tree');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category tree');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch category');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

const initialState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Category Tree
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTree = action.payload;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Category By ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError, setCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;