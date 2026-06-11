import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Input from '../common/Input';
import Button from '../common/Button';
import { showToast } from '../common/Toast';
import { changePassword } from '../../store/slices/userSlice';
import { IoLockClosed, IoEye, IoEyeOff } from 'react-icons/io5';

const ChangePasswordForm = ({ onSubmit, loading: externalLoading = false }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    return true;
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== newPassword) return 'Passwords do not match';
    return true;
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
      } else {
        await dispatch(changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        })).unwrap();
        showToast('success', 'Password changed successfully');
        reset();
      }
    } catch (error) {
      showToast('error', error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <IoLockClosed size={24} className="text-primary-600" />
          <h2 className="text-xl font-semibold">Change Password</h2>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter your current password"
              {...register('currentPassword', { 
                required: 'Current password is required' 
              })}
              error={errors.currentPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              {...register('newPassword', { 
                required: 'New password is required',
                validate: validatePassword
              })}
              error={errors.newPassword?.message}
              helperText="Password must be at least 6 characters and contain uppercase, lowercase, and numbers"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: validateConfirmPassword
              })}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Password Requirements:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• At least one uppercase letter (A-Z)</li>
              <li>• At least one lowercase letter (a-z)</li>
              <li>• At least one number (0-9)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} className="px-8">
          Update Password
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;