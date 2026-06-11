import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState = {
  isSidebarOpen: false,
  isCartOpen: false,
  isModalOpen: false,
  modalContent: null,
  modalProps: {},
  theme: getInitialTheme(),
  isLoading: false,
  toast: {
    open: false,
    message: '',
    severity: 'info', // success, error, warning, info
  },
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalContent = action.payload.content;
      state.modalProps = action.payload.props || {};
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalContent = null;
      state.modalProps = {};
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', state.theme);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleCart,
  setCartOpen,
  openModal,
  closeModal,
  toggleTheme,
  setTheme,
  setLoading,
  showToast,
  hideToast,
  showSnackbar,
  hideSnackbar,
} = uiSlice.actions;

export default uiSlice.reducer;