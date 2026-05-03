const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            // Organize files into folders based on upload type
            if (req.uploadType === 'profile') return 'caryuk/profiles';
            if (req.uploadType === 'car') return 'caryuk/cars';
            return 'caryuk/uploads';
        },
        format: async (req, file) => {
            // Allow specific formats
            const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const ext = file.originalname.split('.').pop().toLowerCase();
            return allowedFormats.includes(ext) ? ext : 'jpg';
        },
        public_id: (req, file) => {
            // Generate unique public ID
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            return `${timestamp}_${randomStr}`;
        },
        quality: 'auto:best', // Optimize image quality
        eager: [
            { width: 200, height: 200, crop: 'thumb', gravity: 'face', quality: 'auto' },
            { width: 400, height: 300, crop: 'fill', quality: 'auto' }
        ],
        eager_async: true
    }
});

// Multer middleware configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Validate file types
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
        }
    }
});

// Export multer instance and Cloudinary
module.exports = {
    upload,
    cloudinary,
    // Helper middleware to set upload type
    setUploadType: (uploadType) => (req, res, next) => {
        req.uploadType = uploadType;
        next();
    }
};
