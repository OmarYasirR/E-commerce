import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from './store/slices/authSlice';
import { fetchCategories } from './store/slices/categorySlice';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastContainer } from './components/common/Toast';


// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import WishlistPage from './pages/WishlistPage';



// Admin Pages (lazy load for better performance)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = React.lazy(() => import('./pages/admin/AdminCoupons'));
const AdminManagement = React.lazy(() => import('./pages/admin/AdminManagement'));
const CategoryManager = React.lazy(() => import('./pages/admin/CategoryManager'));

// Loading component for lazy loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Try to refresh token on app load if token exists
    if (token && !isAuthenticated) {
      dispatch(refreshToken());
    }
    
    // Fetch categories for navigation
    dispatch(fetchCategories());
  }, [dispatch, token, isAuthenticated]);

   // scroll to top when component mounts
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  
  return (
    <>
      <ToastContainer />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="wishlist" element={<WishlistPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route
              path="admin"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </React.Suspense>
              }
            />
            <Route
              path="admin/products"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <AdminProducts />
                </React.Suspense>
              }
            />
            <Route
              path="admin/orders"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <AdminOrders />
                </React.Suspense>
              }
            />
            <Route
              path="admin/users"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <AdminUsers />
                </React.Suspense>
              }
            />
            
            <Route
              path="admin/coupons"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <AdminCoupons />
                </React.Suspense>
              }
            />
            <Route
              path="admin/management"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <AdminManagement />
                </React.Suspense>
              }
            />
          </Route>

          <Route
            path="admin/categories"
            element={
              <React.Suspense fallback={<PageLoader />}>
                <CategoryManager />
              </React.Suspense>
            }
          /> 
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;