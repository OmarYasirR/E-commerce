const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `ecommerce/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    format: 'webp'
  }
});

const uploadToCloudinary = async (file, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `ecommerce/${folder}`,
      use_filename: true,
      unique_filename: true,
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
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

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  createStorage,
  uploadToCloudinary,
  deleteFromCloudinary
};