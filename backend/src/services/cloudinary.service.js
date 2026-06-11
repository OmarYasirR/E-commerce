const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadToCloudinary = async (file, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `ecommerce/${folder}`,
      use_filename: true,
      unique_filename: true,
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' },
        { width: 1200, crop: 'limit' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw error;
  }
};

const uploadBufferToCloudinary = async (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        });
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    return false;
  }
};

const optimizeImage = (url, options = {}) => {
  const { width, height, quality = 'auto', format = 'auto' } = options;
  let optimizedUrl = url;
  
  if (width || height || quality !== 'auto' || format !== 'auto') {
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality !== 'auto') transformations.push(`q_${quality}`);
    if (format !== 'auto') transformations.push(`f_${format}`);
    
    if (transformations.length > 0) {
      const parts = url.split('/upload/');
      optimizedUrl = `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
  }
  
  return optimizedUrl;
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  optimizeImage
};