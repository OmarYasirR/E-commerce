import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import LoginForm from '../components/user/LoginForm';
import { showToast } from '../components/common/Toast';

const LoginPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    if (error) {
      console.log('Login error:', error);
      showToast('error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);
  
  const handleLogin = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      showToast('success', 'Login successful!');
    }
  };
  
  if (isAuthenticated) {
    console.log('user is Authenticated')
    return <Navigate to={from} replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </a>
          </p>
        </div>
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
};

export default LoginPage;