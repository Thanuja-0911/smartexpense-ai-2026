const cloudinary = require('cloudinary').v2;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadToCloudinary = async (filePath, folder = 'smartexpense') => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const result = await cloudinary.uploader.upload(filePath, { folder });
      return result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload error:', err.message);
    }
  }
  // Fallback to local server path URL if Cloudinary credentials are not configured
  const fileName = filePath.replace(/\\/g, '/').split('/').pop();
  return `/uploads/${fileName}`;
};

module.exports = { uploadToCloudinary };
