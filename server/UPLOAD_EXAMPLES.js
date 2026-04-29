/**
 * EXAMPLE USAGE - Upload Controller Functions
 * This file shows how to use the upload system in your controllers
 * 
 * Copy these patterns into your actual controllers:
 * - src/controllers/user.controller.js (for profile uploads)
 * - src/controllers/cars.controller.js (for car image uploads)
 */

const uploadService = require('../utils/uploadService');
const User = require('../models/user.model');
const Car = require('../models/car.model');

// ============================================
// USER PROFILE IMAGE UPLOAD
// ============================================

/**
 * Upload user profile image
 * Route: POST /api/user/upload-profile
 * Middleware: upload.single('profileImage'), setUploadType('profile')
 */\nconst uploadProfileImage = async (req, res, next) => {
    try {\n        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Delete old profile image if exists
        const user = await User.findById(req.user.id);
        if (user?.avatarUrl) {
            const oldPublicId = uploadService.getPublicIdFromUrl(user.avatarUrl);
            if (oldPublicId) {
                await uploadService.deleteFile(oldPublicId);
            }
        }

        // Update user with new image URL
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { avatarUrl: req.file.path },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                url: req.file.path,
                public_id: req.file.filename,
                user: updatedUser
            }
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// CAR IMAGES UPLOAD
// ============================================

/**
 * Upload single car image
 * Route: POST /api/cars/:id/upload-image
 * Middleware: upload.single('carImage'), setUploadType('car')
 */
const uploadCarImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const car = await Car.findById(req.params.id);
        if (!car) {
            // Delete uploaded file if car not found
            await uploadService.deleteFile(req.file.filename);
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Add image to car's images array
        car.images.push(req.file.path);
        await car.save();

        res.status(200).json({
            success: true,
            message: 'Car image uploaded successfully',
            data: {
                url: req.file.path,
                public_id: req.file.filename,
                car: car
            }
        });
    } catch (error) {
        next(error);
    }
};

/**\n * Upload multiple car images
 * Route: POST /api/cars/:id/upload-images
 * Middleware: upload.array('carImages', 10), setUploadType('car')
 */
const uploadCarImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const car = await Car.findById(req.params.id);
        if (!car) {
            // Delete all uploaded files if car not found
            for (const file of req.files) {
                await uploadService.deleteFile(file.filename);
            }
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Add all images to car's images array
        const uploadedUrls = req.files.map(file => file.path);
        car.images.push(...uploadedUrls);
        await car.save();

        res.status(200).json({
            success: true,
            message: 'Car images uploaded successfully',
            data: {
                count: req.files.length,
                urls: uploadedUrls,
                car: car
            }
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// IMAGE DELETION
// ============================================

/**
 * Delete car image
 * Route: DELETE /api/cars/:id/delete-image
 * Body: { imageUrl: 'cloudinary_url_or_public_id' }
 */
const deleteCarImage = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'Image URL is required'
            });
        }

        // Extract public ID from URL
        const publicId = uploadService.getPublicIdFromUrl(imageUrl);
        if (!publicId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid image URL'
            });
        }

        // Delete from Cloudinary
        const deleteResult = await uploadService.deleteFile(publicId);
        if (!deleteResult.success) {
            return res.status(400).json(deleteResult);
        }

        // Remove from car's images array
        const car = await Car.findById(req.params.id);
        car.images = car.images.filter(img => img !== imageUrl);
        await car.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: { car }
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// ROUTE SETUP EXAMPLES
// ============================================

/**
 * Example route setup in cars.routes.js:
 * 
 * const { upload, setUploadType } = require('../config/upload');
 * const uploadErrorHandler = require('../middleware/upload');
 * const carsController = require('../controllers/cars.controller');
 * 
 * // Single image upload
 * router.post(
 *     '/:id/upload-image',
 *     setUploadType('car'),
 *     upload.single('carImage'),
 *     carsController.uploadCarImage,
 *     uploadErrorHandler
 * );
 * 
 * // Multiple images upload (max 10)
 * router.post(
 *     '/:id/upload-images',
 *     setUploadType('car'),
 *     upload.array('carImages', 10),
 *     carsController.uploadCarImages,
 *     uploadErrorHandler
 * );
 * 
 * // Delete image
 * router.delete(
 *     '/:id/delete-image',
 *     carsController.deleteCarImage
 * );
 */

/**
 * Example route setup in user.routes.js:
 * 
 * const { upload, setUploadType } = require('../config/upload');
 * const uploadErrorHandler = require('../middleware/upload');
 * const userController = require('../controllers/user.controller');
 * const verifyJWT = require('../middleware/verifyJWT');
 * 
 * // Upload profile image
 * router.post(
 *     '/upload-profile',
 *     verifyJWT,
 *     setUploadType('profile'),
 *     upload.single('profileImage'),
 *     userController.uploadProfileImage,
 *     uploadErrorHandler
 * );
 */

/**
 * Example frontend usage (React Native / React):
 * 
 * // Upload single image
 * const uploadProfileImage = async (imageUri) => {
 *     const formData = new FormData();
 *     formData.append('profileImage', {
 *         uri: imageUri,
 *         type: 'image/jpeg',
 *         name: 'profile.jpg'
 *     });
 * 
 *     const response = await fetch('http://localhost:5000/api/user/upload-profile', {
 *         method: 'POST',
 *         headers: {
 *             'Authorization': `Bearer ${token}`
 *         },
 *         body: formData
 *     });
 *     return response.json();
 * };
 * 
 * // Upload multiple images
 * const uploadCarImages = async (imageUris, carId) => {
 *     const formData = new FormData();
 *     imageUris.forEach((uri, index) => {
 *         formData.append('carImages', {
 *             uri: uri,
 *             type: 'image/jpeg',
 *             name: `car_${index}.jpg`
 *         });
 *     });
 * 
 *     const response = await fetch(`http://localhost:5000/api/cars/${carId}/upload-images`, {
 *         method: 'POST',
 *         headers: {
 *             'Authorization': `Bearer ${token}`
 *         },
 *         body: formData
 *     });
 *     return response.json();
 * };
 */

module.exports = {
    uploadProfileImage,
    uploadCarImage,
    uploadCarImages,
    deleteCarImage
};
