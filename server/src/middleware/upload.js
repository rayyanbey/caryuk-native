/**
 * Upload error handling middleware
 * Catches multer and other upload errors
 */
const uploadErrorHandler = (err, req, res, next) => {
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File too large. Maximum size is 5MB.'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            error: 'Too many files. Maximum is 10 files per upload.'
        });
    }

    if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({
            success: false,
            error: 'Too many parts in form data.'
        });
    }

    if (err.message === 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.') {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Other errors
    if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
            success: false,
            error: err.message || 'Upload failed'
        });
    }

    next();
};

module.exports = uploadErrorHandler;