const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local file path or file buffer
 * @param {string} folder - Cloudinary folder path (e.g., 'caryuk/cars')
 * @param {string} filename - Public ID for the file
 * @returns {Promise} Upload result with URL
 */
const uploadFile = async (filePath, folder = 'caryuk/uploads', filename = null) => {
    try {
        const uploadOptions = {
            folder: folder,
            quality: 'auto:best',
            eager: [
                { width: 200, height: 200, crop: 'thumb', gravity: 'face' },
                { width: 400, height: 300, crop: 'fill' }
            ],
            eager_async: true
        };

        if (filename) {
            uploadOptions.public_id = filename;
        }

        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        
        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
            eager: result.eager || []
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file paths/buffers
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise} Array of upload results
 */
const uploadMultipleFiles = async (files, folder = 'caryuk/uploads') => {
    try {
        const uploadPromises = files.map(file => 
            uploadFile(file, folder)
        );
        
        const results = await Promise.all(uploadPromises);
        return {
            success: true,
            uploads: results,
            failed: results.filter(r => !r.success).length
        };
    } catch (error) {
        console.error('Multiple files upload error:', error);
        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
};

/**
 * Delete a file from Cloudinary
 * @param {string} public_id - Cloudinary public ID of the file
 * @returns {Promise} Deletion result
 */
const deleteFile = async (public_id) => {
    try {
        if (!public_id) {
            return {
                success: false,
                error: 'Public ID is required'
            };
        }

        const result = await cloudinary.uploader.destroy(public_id);
        
        if (result.result === 'ok') {
            return {
                success: true,
                message: 'File deleted successfully',
                public_id: public_id
            };
        } else {
            return {
                success: false,
                error: 'Failed to delete file',
                result: result.result
            };
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return {
            success: false,
            error: error.message || 'Delete failed'
        };
    }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} public_ids - Array of Cloudinary public IDs
 * @returns {Promise} Deletion results
 */
const deleteMultipleFiles = async (public_ids) => {
    try {
        const deletePromises = public_ids.map(id => deleteFile(id));
        const results = await Promise.all(deletePromises);
        
        return {
            success: true,
            deleted: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results: results
        };
    } catch (error) {
        console.error('Multiple files delete error:', error);
        return {
            success: false,
            error: error.message || 'Delete failed'
        };
    }
};

/**
 * Get file information from Cloudinary
 * @param {string} public_id - Cloudinary public ID
 * @returns {Promise} File information
 */
const getFileInfo = async (public_id) => {
    try {
        const result = await cloudinary.api.resource(public_id);
        return {
            success: true,
            data: {
                public_id: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                size: result.bytes,
                created_at: result.created_at,
                format: result.format
            }
        };
    } catch (error) {
        console.error('Get file info error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get file info'
        };
    }
};

/**
 * Get optimized image URL with transformations
 * @param {string} public_id - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 */
const getOptimizedImageUrl = (public_id, options = {}) => {
    const defaultOptions = {
        width: 400,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(public_id, finalOptions);
};

/**
 * Get thumbnail URL
 * @param {string} public_id - Cloudinary public ID
 * @returns {string} Thumbnail URL
 */
const getThumbnailUrl = (public_id) => {
    return getOptimizedImageUrl(public_id, {
        width: 200,
        height: 200,
        crop: 'thumb',
        gravity: 'face'
    });
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string} Public ID
 */
const getPublicIdFromUrl = (url) => {
    try {
        // Extract from URL like: https://res.cloudinary.com/cloud/image/upload/v123/caryuk/path/filename.ext
        const parts = url.split('/upload/');
        if (parts.length > 1) {
            const path = parts[1].split('.')[0]; // Remove extension
            return path;
        }
        return null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    deleteMultipleFiles,
    getFileInfo,
    getOptimizedImageUrl,
    getThumbnailUrl,
    getPublicIdFromUrl,
    cloudinary
};