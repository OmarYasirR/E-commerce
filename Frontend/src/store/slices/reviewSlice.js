import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewService from '../../services/reviewService';

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 1, limit = 10, rating = null, sort = '-createdAt' }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getProductReviews(productId, { page, limit, rating, sort });
      if (response.success && response.data) {
        return { productId, ...response.data };
      }
      return rejectWithValue(response.message || 'Failed to fetch reviews');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ productId, rating, title, comment, pros, cons, images }, { rejectWithValue }) => {
    try {
      const response = await reviewService.createReview({ productId, rating, title, comment, pros, cons, images });
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to create review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ reviewId, rating, title, comment, pros, cons }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(reviewId, { rating, title, comment, pros, cons });
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to update review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewService.deleteReview(reviewId);
      if (response.success) {
        return reviewId;
      }
      return rejectWithValue(response.message || 'Failed to delete review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async ({ reviewId, helpful = true }, { rejectWithValue }) => {
    try {
      const response = await reviewService.markHelpful(reviewId, helpful);
      if (response.success && response.data) {
        return { reviewId, helpfulCount: response.data.helpful?.count };
      }
      return rejectWithValue(response.message || 'Failed to mark review');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark review');
    }
  }
);

export const getUserReviews = createAsyncThunk(
  'reviews/getUserReviews',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getMyReviews(page, limit);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch your reviews');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your reviews');
    }
  }
);

export const fetchReviewStats = createAsyncThunk(
  'reviews/fetchStats',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviewStats(productId);
      if (response.success && response.data) {
        return { productId, ...response.data };
      }
      return rejectWithValue(response.message || 'Failed to fetch review stats');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review stats');
    }
  }
);

const initialState = {
  reviews: {},
  userReviews: [],
  currentReview: null,
  reviewStats: {},
  loading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearProductReviews: (state, action) => {
      delete state.reviews[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews[action.payload.productId] = {
          reviews: action.payload.reviews || [],
          pagination: action.payload.pagination,
          summary: action.payload.summary,
        };
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createReview.fulfilled, (state, action) => {
        const productId = action.payload.product;
        if (state.reviews[productId]) {
          state.reviews[productId].reviews.unshift(action.payload);
          state.reviews[productId].pagination.total += 1;
        }
      })
      // Update Review
      .addCase(updateReview.fulfilled, (state, action) => {
        const productId = action.payload.product;
        if (state.reviews[productId]) {
          const index = state.reviews[productId].reviews.findIndex(
            r => r._id === action.payload._id
          );
          if (index !== -1) {
            state.reviews[productId].reviews[index] = action.payload;
          }
        }
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const reviewId = action.payload;
        for (const productId in state.reviews) {
          const index = state.reviews[productId].reviews.findIndex(r => r._id === reviewId);
          if (index !== -1) {
            state.reviews[productId].reviews.splice(index, 1);
            state.reviews[productId].pagination.total -= 1;
            break;
          }
        }
      })
      // Mark Review Helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, helpfulCount } = action.payload;
        for (const productId in state.reviews) {
          const review = state.reviews[productId].reviews.find(r => r._id === reviewId);
          if (review) {
            review.helpful = { count: helpfulCount };
            break;
          }
        }
      })
      // Get User Reviews
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.userReviews = action.payload.reviews || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1,
        };
      })
      // Fetch Review Stats
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.reviewStats[action.payload.productId] = {
          averageRating: action.payload.averageRating,
          totalReviews: action.payload.totalReviews,
          distribution: action.payload.distribution,
        };
      });
  },
});

export const { clearReviewError, clearCurrentReview, clearProductReviews } = reviewSlice.actions;
export default reviewSlice.reducer;