const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables (trim values)
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('[cloudinary] Missing Cloudinary env vars. Uploads will fallback to memory (dev only).');
}

try {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} catch (err) {
  console.error('[cloudinary] Failed to configure cloudinary:', err && err.message ? err.message : err);
}

// Setup Multer storage backed by Cloudinary. If cloud config is missing, fallback to memory storage.
let parser;
try {
  if (cloudName && apiKey && apiSecret) {
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'lost-found',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }]
      }
    });

    parser = multer({ storage });
  } else {
    // Fallback: store file in memory buffer (so routes can handle missing req.file gracefully)
    parser = multer({ storage: multer.memoryStorage() });
  }
} catch (err) {
  console.error('[cloudinary] Error creating storage parser:', err && err.message ? err.message : err);
  parser = multer({ storage: multer.memoryStorage() });
}

module.exports = {
  cloudinary,
  parser
};
