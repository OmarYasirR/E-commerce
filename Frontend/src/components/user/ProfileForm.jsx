import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Input from '../common/Input';
import Button from '../common/Button';
import { showToast } from '../common/Toast';
import { updateProfile } from '../../store/slices/userSlice';
import { updateUser } from '../../store/slices/authSlice';

const ProfileForm = ({ initialData, onSubmit, loading: externalLoading = false }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      preferences: {
        newsletter: initialData?.preferences?.newsletter || false,
        notifications: initialData?.preferences?.notifications || true,
        language: initialData?.preferences?.language || 'en',
        currency: initialData?.preferences?.currency || 'USD',
      },
    },
  });

  const validatePhoneNumber = (value) => {
    if (!value) return true; // Phone is optional
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    return true;
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      if (onSubmit) {
        result = await onSubmit(data);
      } else {
        result = await dispatch(updateProfile(data)).unwrap();
        dispatch(updateUser(result));
        showToast('success', 'Profile updated successfully');
      }
      return result;
    } catch (error) {
      showToast('error', error || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              },
              maxLength: {
                value: 50,
                message: 'Name cannot exceed 50 characters'
              }
            })}
            error={errors.name?.message}
          />
          
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            disabled
            value={initialData?.email}
            helperText="Email cannot be changed"
          />
          
          <Input
            label="Phone Number"
            placeholder="+1 234 567 8900"
            {...register('phoneNumber', {
              validate: validatePhoneNumber
            })}
            error={errors.phoneNumber?.message}
            helperText="Optional. Include country code"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium">Newsletter Subscription</p>
              <p className="text-sm text-gray-500">Receive updates about new products and offers</p>
            </div>
            <input
              type="checkbox"
              {...register('preferences.newsletter')}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Get notified about order updates</p>
            </div>
            <input
              type="checkbox"
              {...register('preferences.notifications')}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                {...register('preferences.language')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Currency
              </label>
              <select
                {...register('preferences.currency')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} className="px-8">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;