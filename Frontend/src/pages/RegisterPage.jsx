import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import RegisterForm from '../components/user/RegisterForm';
import { showToast } from '../components/common/Toast';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (error) {
      showToast('error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);
  
  const handleRegister = async (data) => {
    const result = await dispatch(register(data));
    if (register.fulfilled.match(result)) {
      showToast('success', 'Registration successful! Please login.');
    }
  };
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </a>
          </p>
        </div>
        <RegisterForm onSubmit={handleRegister} loading={loading} />
      </div>
    </div>
  );
};

export default RegisterPage;