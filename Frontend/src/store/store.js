import { configureStore } from '@reduxjs/toolkit';
import {
  authReducer,
  cartReducer,
  productReducer,
  categoryReducer,
  orderReducer,
  userReducer,
  uiReducer,
  reviewReducer,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    categories: categoryReducer,
    orders: orderReducer,
    user: userReducer,
    ui: uiReducer,
    reviews: reviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;