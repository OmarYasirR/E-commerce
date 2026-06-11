import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

// Async thunks for server cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      // Backend returns: { success, data: { items, subtotal, total, couponCode, discount } }
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, variant = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity, variant);
      if (response.success && response.data) {  
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to add to cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity, variant = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(productId, quantity, variant);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to update cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId, variant = null }, { rejectWithValue }) => {
    console.log('Removing from cart:', productId, 'Variant:', variant);
    try {
      const response = await cartService.removeFromCart(productId, variant);
      if (response.success && response.data) {
        console.log(response.data.items);
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to remove from cart');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to clear cart');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponCode, { rejectWithValue }) => {
    try {
      const response = await cartService.applyCoupon(couponCode);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to apply coupon');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.removeCoupon();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to remove coupon');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
    }
  }
);

const initialState = {
  items: [],
  currentProduct: null,
  subtotal: 0,
  discount: 0,
  total: 0,
  couponCode: null,
  itemCount: 0,
  loading: false,
  updating: false,
  isAdding: false,
  isDeleting: false,
  error: null,
  synced: true,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    
    // Local cart operations for offline support
    addToCartLocal: (state, action) => {
      state.currentProduct = action.payload.productId;
      const existingItem = state.items.find(
        item => item.product._id === action.payload.productId
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
        existingItem.total = existingItem.price * existingItem.quantity;
      } else {
        state.items.push({
          product: action.payload.productId,
          name: action.payload.name,
          price: action.payload.price,
          quantity: action.payload.quantity || 1,
          total: action.payload.price * (action.payload.quantity || 1),
          image: action.payload.image
        });
      }
      
      state.subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
      state.total = state.subtotal - state.discount;
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.synced = false;
    },
    
    // Update quantity locally (for optimistic updates)
    updateQuantity: (state, action) => {
      const { productId, quantity, variant = null } = action.payload;
      state.currentProduct = productId;
      const item = state.items.find(
        item => item.product._id === productId || item.product === productId
      );
      
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(
            i => (i.product._id !== productId && i.product !== productId)
          );
        } else {
          item.quantity = quantity;
          item.total = item.price * quantity;
        }
        
        // Recalculate totals
        state.subtotal = state.items.reduce((sum, i) => sum + i.total, 0);
        state.total = state.subtotal - state.discount;
        state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.synced = false;
      }
    },
    
    // Update quantity with debounce for API calls
    updateQuantityDebounced: (state, action) => {
      const { productId, quantity, variant = null } = action.payload;
      state.currentProduct = productId;
      const item = state.items.find(
        item => item.product._id === productId || item.product === productId
      );
      
      if (item && quantity > 0) {
        item.quantity = quantity;
        item.total = item.price * quantity;
        
        // Recalculate totals
        state.subtotal = state.items.reduce((sum, i) => sum + i.total, 0);
        state.total = state.subtotal - state.discount;
        state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
      }
    },
    
    // Sync local cart with server
    syncCart: (state) => {
      state.synced = true;
    },
    
    // Set cart synced status
    setCartSynced: (state, action) => {
      state.synced = action.payload;
    },
    
    // Reset cart to initial state
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.discount = action.payload.discount || 0;
        state.total = action.payload.total || 0;
        state.couponCode = action.payload.couponCode || null;
        state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        state.synced = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state, action ) => {
        state.currentProduct = action.meta.arg.productId;
        console.log('adding to cart')
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        // console.log(actions.payload.items)
        state.currentProduct = null;
        state.isAdding = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.discount = action.payload.discount || 0;
        state.total = action.payload.total || 0;
        state.couponCode = action.payload.couponCode || null;
        state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        state.synced = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.currentProduct = null;
        state.isAdding = false;
        state.error = action.payload;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state, action) => {
        state.currentProduct = action.meta.arg.productId;
        state.updating = true;
        state.error = null;
        // Optimistic update: update quantity immediately
        const { productId, quantity } = action.meta.arg;
        const item = state.items.find(
          item => item.product._id === productId || item.product === productId
        );
        if (item && quantity > 0) {
          item.quantity = quantity;
          item.total = item.price * quantity;
          state.subtotal = state.items.reduce((sum, i) => sum + i.total, 0);
          state.total = state.subtotal - state.discount;
          state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.updating = false;
        state.currentProduct = null;
        // Use server data to ensure consistency
        if (action.payload) {
          state.items = action.payload.items || [];
          state.subtotal = action.payload.subtotal || 0;
          state.discount = action.payload.discount || 0;
          state.total = action.payload.total || 0;
          state.couponCode = action.payload.couponCode || null;
          state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
        state.synced = true;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.updating  = false;
        state.currentProduct = null;
        state.error = action.payload;
        // Revert optimistic update on failure - refetch from server
        state.synced = false;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state, action) => {
        state.currentProduct = action.meta.arg.productId;
        state.isDeleting = true;
        state.error = null;

      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isDeleting = false;
        state.currentProduct = null;
        state.error = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.currentProduct = null;
        state.isDeleting = false;
        console.log(action.payload.items)
        console.log(state.items)
        state.items = action.payload.items
        state.subtotal = action.payload.subtotal || 0;  
        state.discount = action.payload.discount || 0;
        state.total = action.payload.total || 0;
        state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        state.synced = true;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.subtotal = 0;
        state.discount = 0;
        state.total = 0;
        state.couponCode = null;
        state.itemCount = 0;
        state.synced = true;
      })
      // Apply Coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.discount = action.payload.discount || 0;
        state.couponCode = action.payload.couponCode || null;
        state.total = action.payload.total || state.subtotal - state.discount;
        state.synced = true;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove Coupon
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.discount = 0;
        state.couponCode = null;
        state.total = action.payload.total || state.subtotal;
        state.synced = true;
      });
  },
});

export const { 
  clearCartError, 
  addToCartLocal, 
  updateQuantity, 
  updateQuantityDebounced,
  syncCart,
  setCartSynced,
  resetCart 
} = cartSlice.actions;

export default cartSlice.reducer;