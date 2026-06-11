import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Input from '../common/Input';
import Button from '../common/Button';
import { showToast } from '../common/Toast';
import { addAddress, updateAddress } from '../../store/slices/userSlice';

const AddressForm = ({ address, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: address || {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: '',
      email: '',
      addressType: 'both',
      isDefault: false,
    },
  });

  const validatePhoneNumber = (value) => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    return true;
  };

  const validatePostalCode = (value) => {
    if (!value) return 'Postal code is required';
    const postalRegex = /^[A-Za-z0-9\s-]{3,10}$/;
    if (!postalRegex.test(value)) return 'Please enter a valid postal code';
    return true;
  };

  const validateEmail = (value) => {
    if (value && value.trim()) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
    }
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await dispatch(updateAddress({ addressId: address._id, addressData: data })).unwrap();
        showToast('success', 'Address updated successfully');
      } else {
        await dispatch(addAddress(data)).unwrap();
        showToast('success', 'Address added successfully');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast('error', error || `Failed to ${isEditing ? 'update' : 'add'} address`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          {...register('fullName', { required: 'Full name is required' })}
          error={errors.fullName?.message}
        />
        
        <Input
          label="Email (Optional)"
          type="email"
          placeholder="john@example.com"
          {...register('email', { validate: validateEmail })}
          error={errors.email?.message}
        />
        
        <Input
          label="Phone Number"
          placeholder="+1 234 567 8900"
          {...register('phone', { 
            required: 'Phone number is required',
            validate: validatePhoneNumber
          })}
          error={errors.phone?.message}
        />
        
        <Input
          label="Country"
          placeholder="Country"
          {...register('country', { required: 'Country is required' })}
          error={errors.country?.message}
        />
        
        <div className="md:col-span-2">
          <Input
            label="Address Line 1"
            placeholder="Street address"
            {...register('addressLine1', { required: 'Address is required' })}
            error={errors.addressLine1?.message}
          />
        </div>
        
        <div className="md:col-span-2">
          <Input
            label="Address Line 2 (Optional)"
            placeholder="Apartment, suite, etc."
            {...register('addressLine2')}
            error={errors.addressLine2?.message}
          />
        </div>
        
        <Input
          label="City"
          placeholder="City"
          {...register('city', { required: 'City is required' })}
          error={errors.city?.message}
        />
        
        <Input
          label="State"
          placeholder="State"
          {...register('state', { required: 'State is required' })}
          error={errors.state?.message}
        />
        
        <Input
          label="Postal Code"
          placeholder="Zip code"
          {...register('postalCode', { 
            required: 'Postal code is required',
            validate: validatePostalCode
          })}
          error={errors.postalCode?.message}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Type
          </label>
          <select
            {...register('addressType')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="shipping">Shipping Only</option>
            <option value="billing">Billing Only</option>
            <option value="both">Both (Shipping & Billing)</option>
          </select>
        </div>
        
        <div className="flex items-center justify-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isDefault')}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={loading}>
          {isEditing ? 'Update Address' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;