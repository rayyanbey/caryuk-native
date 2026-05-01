const User = require('../models/user.model');
const Car = require('../models/car.model');
require('dotenv').config();

/**
 * GET PROFILE
 * GET /api/user/profile
 * Headers: Authorization: Bearer {token}
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .select('-password')
            .populate('favourites', 'name images price provider');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE PROFILE
 * PUT /api/user/profile
 * Headers: Authorization: Bearer {token}
 * Body: { name, phone, avatarUrl }
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { name, phone, avatarUrl } = req.body;

        // Validation
        if (!name && !phone && !avatarUrl) {
            return res.status(400).json({
                success: false,
                error: 'At least one field is required to update'
            });
        }

        // Build update object
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone) updateData.phone = phone.trim();
        if (avatarUrl) updateData.avatarUrl = avatarUrl;

        // Find and update user
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE USER ACCOUNT
 * DELETE /api/user/:id
 * Headers: Authorization: Bearer {token}
 */
const deleteUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Security: Only allow users to delete their own account
        if (userId !== id) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own account'
            });
        }

        // Delete user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET FAVORITES
 * GET /api/user/favorites
 * Headers: Authorization: Bearer {token}
 */
const getFavorites = async (req, res, next) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .select('favourites')
            .populate({
                path: 'favourites',
                model: 'Car',
                select: 'name images price description provider seatsCount fuelType transmission'
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.favourites,
            count: user.favourites.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ADD TO FAVORITES
 * POST /api/user/favorites/:carId
 * Headers: Authorization: Bearer {token}
 */
const addFavorite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { carId } = req.params;

        // Check if car exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Add to favorites if not already there
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favourites: carId } }, // $addToSet prevents duplicates
            { new: true }
        ).populate('favourites', 'name images price');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Car added to favorites',
            data: user.favourites
        });
    } catch (error) {
        next(error);
    }
};

/**
 * REMOVE FROM FAVORITES
 * DELETE /api/user/favorites/:carId
 * Headers: Authorization: Bearer {token}
 */
const removeFavorite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { carId } = req.params;

        // Remove from favorites
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { favourites: carId } }, // $pull removes item from array
            { new: true }
        ).populate('favourites', 'name images price');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Car removed from favorites',
            data: user.favourites
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    deleteUser,
    getFavorites,
    addFavorite,
    removeFavorite
};