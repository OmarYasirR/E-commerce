import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in Cloudinary (default: 'products')
 * @returns {Promise<Object>} - Upload result with url, publicId, etc.
 */
export const uploadToCloudinary = async (file, folder = 'products') => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error('Cloudinary credentials missing. Check your environment variables.');
    throw new Error('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `ecommerce/${folder}`);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      }
    );

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
      format: response.data.format,
      size: response.data.bytes,
      originalFilename: response.data.original_filename,
      createdAt: response.data.created_at,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.message) {
      throw new Error(`Upload failed: ${error.response.data.error.message}`);
    }
    
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files
 * @param {string} folder - The folder path in Cloudinary
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, folder = 'products') => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Failed to upload one or more images');
  }
};

/**
 * Delete an image from Cloudinary (requires backend API for security)
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error('No publicId provided');
  }

  // Note: For security, this should be handled by your backend API
  // because it requires your API secret which should not be exposed on the frontend
  
  try {
    // Call your backend API to delete the image
    const response = await axios.delete(`/api/uploads/cloudinary/${publicId}`);
    return response.data;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Optimize image URL with transformations
 * @param {string} url - The original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return '';
  
  const { width, height, quality = 'auto', format = 'auto', crop = 'limit' } = options;
  
  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality !== 'auto') transformations.push(`q_${quality}`);
  if (format !== 'auto') transformations.push(`f_${format}`);
  
  if (transformations.length === 0) return url;
  
  // Insert transformations before /upload/
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }
  
  return url;
};

/**
 * Get a placeholder image URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Placeholder text
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (width = 300, height = 300, text = 'No Image') => {
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
};

/**
 * Validate image file before upload
 * @param {File} file - The image file to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload JPEG, PNG, WEBP, or GIF images only.' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
    };
  }
  
  return { valid: true };
};

/**
 * Get Cloudinary URL with responsive transformations
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Desired width
 * @returns {string} - Responsive image URL
 */
export const getResponsiveImageUrl = (url, width = 500) => {
  return optimizeImageUrl(url, { 
    width, 
    quality: 'auto', 
    format: 'auto',
    crop: 'limit'
  });
};

/**
 * Get thumbnail URL
 * @param {string} url - Original Cloudinary URL
 * @param {number} size - Thumbnail size
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (url, size = 150) => {
  return optimizeImageUrl(url, { 
    width: size, 
    height: size, 
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto'
  });
};

/**
 * Get blurred placeholder URL for lazy loading
 * @param {string} url - Original Cloudinary URL
 * @returns {string} - Blurred placeholder URL
 */
export const getBlurredPlaceholder = (url) => {
  return optimizeImageUrl(url, { 
    width: 20, 
    quality: 10, 
    blur: 500,
    effect: 'blur:500'
  });
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  optimizeImageUrl,
  getPlaceholderImage,
  validateImageFile,
  getResponsiveImageUrl,
  getThumbnailUrl,
  getBlurredPlaceholder,
};