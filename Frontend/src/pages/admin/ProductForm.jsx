import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { IoClose, IoAdd, IoTrash, IoCloudUpload, IoImage } from 'react-icons/io5';
import { showToast } from '../../components/common/Toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { uploadToCloudinary } from '../../services/cloudinaryService';

const ProductForm = ({ product, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: product || {
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: '',
      compareAtPrice: '',
      costPerItem: '',
      quantity: '',
      sku: '',
      category: '',
      tags: [],
      status: 'active',
      isFeatured: false,
      isDigital: false,
      weight: { value: '', unit: 'kg' },
      dimensions: { length: '', width: '', height: '', unit: 'cm' },
      seo: { title: '', description: '', keywords: [] }
    }
  });
  
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  });
  
  useEffect(() => {
    fetchCategories();
    if (product && product.images) {
      setExistingImages(product.images);
    }
  }, [product]);
  
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();

      setCategories(response || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      const uploadedImages = [];
      for (const file of files) {
        const result = await uploadToCloudinary(file, 'products');
        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
          isMain: existingImages.length === 0 && uploadedImages.length === 0
        });
      }
      
      setExistingImages([...existingImages, ...uploadedImages]);
      showToast('success', `${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      showToast('error', 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };
  
  const handleRemoveImage = (index, publicId) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
    // Optionally delete from Cloudinary
    // if (publicId) deleteFromCloudinary(publicId);
  };
  
  const handleSetMainImage = (index) => {
    const updatedImages = existingImages.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setExistingImages(updatedImages);
  };
  
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Prepare product data
      const productData = {
        ...data,
        price: parseFloat(data.price),
        compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : undefined,
        costPerItem: data.costPerItem ? parseFloat(data.costPerItem) : undefined,
        quantity: parseInt(data.quantity),
        images: existingImages,
        tags: data.tags?.filter(tag => tag.value)?.map(tag => tag.value) || [],
        variants: data.variants?.map(variant => ({
          ...variant,
          price: parseFloat(variant.price),
          quantity: parseInt(variant.quantity)
        })) || []
      };
      
      let response;
      if (product) {
        // Update existing product
        response = await productService.updateProduct(product._id, productData);
        showToast('success', 'Product updated successfully');
      } else {
        // Create new product
        response = await productService.createProduct(productData);
        showToast('success', 'Product created successfully');
      }
      
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save product');
      console.log(error)
    } finally {
      setLoading(false);
    }
  };
  
  const watchIsDigital = watch('isDigital');
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            placeholder="Enter product name"
            {...register('name', { required: 'Product name is required' })}
            error={errors.name?.message}
          />
          
          <Input
            label="SKU"
            placeholder="Unique product code"
            {...register('sku')}
            error={errors.sku?.message}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              placeholder="Brief product description"
              {...register('shortDescription')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
            <textarea
              rows={5}
              placeholder="Detailed product description"
              {...register('description', { required: 'Description is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Pricing & Stock */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Pricing & Stock</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Price *"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            error={errors.price?.message}
          />
          
          <Input
            label="Compare at Price"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('compareAtPrice')}
            error={errors.compareAtPrice?.message}
          />
          
          <Input
            label="Cost per Item"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('costPerItem')}
            error={errors.costPerItem?.message}
          />
          
          <Input
            label="Quantity *"
            type="number"
            placeholder="0"
            {...register('quantity', { 
              required: 'Quantity is required',
              min: { value: 0, message: 'Quantity must be positive' }
            })}
            error={errors.quantity?.message}
          />
        </div>
      </div>
      
      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Product Images</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImages}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <IoCloudUpload size={20} />
            {uploadingImages ? 'Uploading...' : 'Select Images'}
          </label>
          <p className="text-sm text-gray-500 mt-2">Upload up to 10 images (JPG, PNG, WEBP)</p>
        </div>
        
        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {existingImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(index)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  >
                    {image.isMain ? 'Main' : 'Set Main'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index, image.publicId)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <IoTrash size={14} />
                  </button>
                </div>
                {image.isMain && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Tags</h3>
        
        <div className="space-y-2">
          {tagFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder="Tag name"
                {...register(`tags.${index}.value`)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <IoTrash size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendTag({ value: '' })}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <IoAdd /> Add Tag
          </button>
        </div>
      </div>
      
      {/* Digital Product Option */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Product Type</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('isDigital')}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span>This is a digital product</span>
        </label>
      </div>
      
      {/* Variants (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Variants (Optional)</h3>
        
        {variantFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Variant {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-red-500 hover:text-red-700"
              >
                <IoTrash size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="SKU"
                placeholder="Variant SKU"
                {...register(`variants.${index}.sku`)}
              />
              <Input
                label="Price"
                type="number"
                step="0.01"
                placeholder="Price"
                {...register(`variants.${index}.price`)}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="Quantity"
                {...register(`variants.${index}.quantity`)}
              />
              <Input
                label="Attributes (JSON)"
                placeholder='{"color": "red", "size": "M"}'
                {...register(`variants.${index}.attributes`)}
              />
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => appendVariant({ sku: '', price: '', quantity: '', attributes: {} })}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <IoAdd /> Add Variant
        </button>
      </div>
      
      {/* SEO */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">SEO Settings</h3>
        
        <Input
          label="Meta Title"
          placeholder="SEO title"
          {...register('seo.title')}
        />
        
        <Input
          label="Meta Description"
          placeholder="SEO description"
          {...register('seo.description')}
        />
        
        <Input
          label="Meta Keywords"
          placeholder="keyword1, keyword2, keyword3"
          {...register('seo.keywords')}
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <Button type="submit" isLoading={loading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;