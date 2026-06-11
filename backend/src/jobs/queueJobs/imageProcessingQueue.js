const Queue = require('bull');
const sharp = require('sharp');
const { uploadBufferToCloudinary } = require('../../services/cloudinary.service');
const logger = require('../../utils/logger');

const imageProcessingQueue = new Queue('image-processing', process.env.REDIS_URL);

imageProcessingQueue.process(async (job) => {
  const { imageBuffer, options } = job.data;
  
  try {
    let processedImage = sharp(imageBuffer);
    
    if (options.resize) {
      processedImage = processedImage.resize(options.resize.width, options.resize.height, {
        fit: 'cover',
        position: 'center'
      });
    }
    
    if (options.quality) {
      processedImage = processedImage.jpeg({ quality: options.quality });
    }
    
    const optimizedBuffer = await processedImage.toBuffer();
    
    const result = await uploadBufferToCloudinary(optimizedBuffer, options.folder || 'products');
    
    logger.info(`Image processed and uploaded: ${result.publicId}`);
    
    return result;
  } catch (error) {
    logger.error('Image processing failed:', error);
    throw error;
  }
});

imageProcessingQueue.on('failed', (job, err) => {
  logger.error(`Image processing job ${job.id} failed:`, err);
});

module.exports = imageProcessingQueue;