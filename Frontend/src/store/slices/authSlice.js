import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Backend returns: { success, message, data: { user, token, refreshToken } }
      if (response.success && response.data) {
        localStorage.setItem('shop-token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('shop-user', JSON.stringify(response.data.user));
        return response.data;
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // Backend returns: { success, message, data: { user, token, refreshToken } }
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    localStorage.removeItem('shop-token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('shop-user');
  } catch (error) {
    console.error('Logout error:', error);
  }
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authService.refreshToken(refreshToken);
      if (response.success && response.data) {
        localStorage.setItem('shop-token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
      }
      return rejectWithValue(response.message || 'Token refresh failed');
    } catch (error) {
      localStorage.removeItem('shop-token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('shop-user');
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.message || 'Password change failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('shop-user')) || null,
  token: localStorage.getItem('shop-token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: localStorage.getItem('shop-token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('shop-user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        console.log('logging in...')
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        console.log('Login error:', action.payload);
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        // Don't auto-login after registration, user needs to verify email or login
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;