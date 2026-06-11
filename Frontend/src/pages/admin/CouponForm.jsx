import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  IoPricetag,
  IoCash,
  IoCalendar,
  IoPeople,
  IoInfinite,
  IoFlag,
  IoGift,
  IoBan,
  IoCheckmarkCircle,
  IoWarning,
  IoInformation,
  IoAdd,
  IoTrash,
  IoClose,
  IoCubeOutline,
  IoFolderOpen,
  IoRocket,
} from 'react-icons/io5';
import { FaPercentage, FaDollarSign } from 'react-icons/fa';
import { showToast } from '../../components/common/Toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';

const schema = yup.object({
  code: yup
    .string()
    .required('Coupon code is required')
    .matches(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only')
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code cannot exceed 20 characters'),
  name: yup
    .string()
    .required('Coupon name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
  discountType: yup.string().required('Discount type is required').oneOf(['percentage', 'fixed']),
  discountValue: yup
    .number()
    .required('Discount value is required')
    .positive('Discount value must be positive')
    .max(100, 'Percentage discount cannot exceed 100%'),
  minimumOrderAmount: yup.number().min(0, 'Minimum order amount cannot be negative').default(0),
  maximumDiscountAmount: yup.number().nullable().min(0, 'Maximum discount amount cannot be negative'),
  usageLimit: yup.number().nullable().min(1, 'Usage limit must be at least 1'),
  perUserLimit: yup.number().min(1, 'Per user limit must be at least 1').default(1),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  freeShipping: yup.boolean().default(false),
  isFirstOrderOnly: yup.boolean().default(false),
  stackable: yup.boolean().default(false),
});

const CouponForm = ({ coupon, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [applicableProducts, setApplicableProducts] = useState([]);
  const [excludedProducts, setExcludedProducts] = useState([]);
  const [applicableCategories, setApplicableCategories] = useState([]);
  const [excludedCategories, setExcludedCategories] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: coupon || {
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: 0,
      maximumDiscountAmount: null,
      usageLimit: null,
      perUserLimit: 1,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      freeShipping: false,
      isFirstOrderOnly: false,
      stackable: false,
    },
  });

  const discountType = watch('discountType');

  useEffect(() => {
    fetchCategories();
    if (coupon) {
      setApplicableProducts(coupon.applicableProducts || []);
      setExcludedProducts(coupon.excludedProducts || []);
      setApplicableCategories(coupon.applicableCategories || []);
      setExcludedCategories(coupon.excludedCategories || []);
    }
  }, [coupon]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const searchProductsHandler = async () => {
    if (!searchProducts.trim()) return;
    try {
      const response = await productService.getProducts({ search: searchProducts, limit: 10 });
      setProductSearchResults(response.data?.products || []);
      setShowProductSearch(true);
    } catch (error) {
      console.error('Failed to search products:', error);
    }
  };

  const addApplicableProduct = (product) => {
    if (!applicableProducts.find(p => p._id === product._id)) {
      setApplicableProducts([...applicableProducts, product]);
    }
    setShowProductSearch(false);
    setSearchProducts('');
    setProductSearchResults([]);
  };

  const removeApplicableProduct = (productId) => {
    setApplicableProducts(applicableProducts.filter(p => p._id !== productId));
  };

  const addExcludedProduct = (product) => {
    if (!excludedProducts.find(p => p._id === product._id)) {
      setExcludedProducts([...excludedProducts, product]);
    }
    setShowProductSearch(false);
    setSearchProducts('');
    setProductSearchResults([]);
  };

  const removeExcludedProduct = (productId) => {
    setExcludedProducts(excludedProducts.filter(p => p._id !== productId));
  };

  const toggleApplicableCategory = (categoryId) => {
    if (applicableCategories.includes(categoryId)) {
      setApplicableCategories(applicableCategories.filter(id => id !== categoryId));
    } else {
      setApplicableCategories([...applicableCategories, categoryId]);
    }
  };

  const toggleExcludedCategory = (categoryId) => {
    if (excludedCategories.includes(categoryId)) {
      setExcludedCategories(excludedCategories.filter(id => id !== categoryId));
    } else {
      setExcludedCategories([...excludedCategories, categoryId]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const couponData = {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minimumOrderAmount: parseFloat(data.minimumOrderAmount),
        maximumDiscountAmount: data.maximumDiscountAmount ? parseFloat(data.maximumDiscountAmount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        perUserLimit: parseInt(data.perUserLimit),
        applicableProducts: applicableProducts.map(p => p._id),
        excludedProducts: excludedProducts.map(p => p._id),
        applicableCategories: applicableCategories,
        excludedCategories: excludedCategories,
      };

      let response;
      if (coupon) {
        response = await adminService.updateCoupon(coupon._id, couponData);
        showToast('success', 'Coupon updated successfully');
      } else {
        response = await adminService.createCoupon(couponData);
        showToast('success', 'Coupon created successfully');
      }
      
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto px-2">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <IoPricetag className="text-primary-500" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Coupon Code *"
            placeholder="e.g., SUMMER2024"
            {...register('code')}
            error={errors.code?.message}
            helperText="Uppercase letters and numbers only, no spaces"
          />
          
          <Input
            label="Coupon Name *"
            placeholder="e.g., Summer Sale 2024"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the coupon and its terms..."
            {...register('description')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Discount Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <FaPercentage className="text-primary-500" />
          Discount Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount Type *
            </label>
            <select
              {...register('discountType')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
            {errors.discountType && (
              <p className="text-red-500 text-sm mt-1">{errors.discountType.message}</p>
            )}
          </div>
          
          <Input
            label={`Discount Value * (${discountType === 'percentage' ? '%' : '$'})`}
            type="number"
            step="0.01"
            placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'}
            {...register('discountValue')}
            error={errors.discountValue?.message}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Minimum Order Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('minimumOrderAmount')}
            error={errors.minimumOrderAmount?.message}
            helperText="Minimum cart total required (0 = no minimum)"
          />
          
          {discountType === 'percentage' && (
            <Input
              label="Maximum Discount Amount"
              type="number"
              step="0.01"
              placeholder="Unlimited"
              {...register('maximumDiscountAmount')}
              error={errors.maximumDiscountAmount?.message}
              helperText="Maximum discount amount for percentage coupons"
            />
          )}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <IoPeople className="text-primary-500" />
          Usage Limits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Global Usage Limit"
            type="number"
            placeholder="Unlimited"
            {...register('usageLimit')}
            error={errors.usageLimit?.message}
            helperText="Total number of times this coupon can be used"
          />
          
          <Input
            label="Per User Limit"
            type="number"
            placeholder="1"
            {...register('perUserLimit')}
            error={errors.perUserLimit?.message}
            helperText="How many times each user can use this coupon"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <IoCalendar className="text-primary-500" />
          Validity Period
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              {...register('startDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              {...register('endDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <IoRocket className="text-primary-500" />
          Additional Options
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('freeShipping')}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Free Shipping
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isFirstOrderOnly')}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              First Order Only
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('stackable')}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Stackable with other coupons
            </span>
          </label>
        </div>
      </div>

      {/* Product/Category Restrictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <IoGift className="text-primary-500" />
          Product & Category Restrictions
        </h3>
        
        {/* Applicable Products */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Applicable Products (Optional)
          </label>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={searchProducts}
              onChange={(e) => setSearchProducts(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={searchProductsHandler}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
          </div>
          
          {showProductSearch && productSearchResults.length > 0 && (
            <div className="border rounded-lg mb-2 max-h-40 overflow-y-auto">
              {productSearchResults.map(product => (
                <div
                  key={product._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => addApplicableProduct(product)}
                >
                  <span>{product.name}</span>
                  <IoAdd className="text-green-500" />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {applicableProducts.map(product => (
              <div key={product._id} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <span className="text-sm">{product.name}</span>
                <button
                  type="button"
                  onClick={() => removeApplicableProduct(product._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <IoClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Excluded Products */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excluded Products (Optional)
          </label>
          
          {showProductSearch && productSearchResults.length > 0 && (
            <div className="border rounded-lg mb-2 max-h-40 overflow-y-auto">
              {productSearchResults.map(product => (
                <div
                  key={product._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => addExcludedProduct(product)}
                >
                  <span>{product.name}</span>
                  <IoAdd className="text-green-500" />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {excludedProducts.map(product => (
              <div key={product._id} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                <span className="text-sm">{product.name}</span>
                <button
                  type="button"
                  onClick={() => removeExcludedProduct(product._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <IoClose size={16} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Coupon will NOT apply to excluded products</p>
        </div>
        
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Applicable Categories
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 dark:border-gray-700">
              {categories.map(category => (
                <label key={category._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applicableCategories.includes(category._id)}
                    onChange={() => toggleApplicableCategory(category._id)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">No categories found</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excluded Categories
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 dark:border-gray-700">
              {categories.map(category => (
                <label key={category._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludedCategories.includes(category._id)}
                    onChange={() => toggleExcludedCategory(category._id)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">No categories found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900 py-4">
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Cancel
        </button>
        <Button type="submit" isLoading={loading}>
          {coupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
};

export default CouponForm;