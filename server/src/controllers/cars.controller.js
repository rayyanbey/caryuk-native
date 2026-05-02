const Car = require('../models/car.model');
const User = require('../models/user.model');
require('dotenv').config();

/**
 * GET ALL CARS
 * GET /api/cars
 * Query: { page, limit, category, fuelType, transmission, minPrice, maxPrice, search }
 */
const getAllCars = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, fuelType, transmission, minPrice, maxPrice, search } = req.query;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { status: 'available' };
        if (category) filter.category = category;
        if (fuelType) filter.fuelType = fuelType;
        if (transmission) filter.transmission = transmission;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseInt(minPrice);
            if (maxPrice) filter.price.$lte = parseInt(maxPrice);
        }
        if (search) {
            filter.$text = { $search: search };
        }

        // Get total count
        const total = await Car.countDocuments(filter);

        // Get cars
        const cars = await Car.find(filter)
            .populate('seller', 'name email avatarUrl phone')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: cars,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET CAR BY ID
 * GET /api/cars/:id
 */
const getCarById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const car = await Car.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('seller', 'name email avatarUrl phone');

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        res.status(200).json({
            success: true,
            data: car
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CREATE CAR
 * POST /api/cars
 * Headers: Authorization: Bearer {token}
 * Body: { title, brand, model, year, price, category, fuelType, transmission, color, mileage, description, features, images }
 */
const createCar = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { title, brand, model, year, price, category, fuelType, transmission, color, mileage, description, features, images } = req.body;

        // Validation
        if (!title || !brand || !model || !year || !price) {
            return res.status(400).json({
                success: false,
                error: 'Title, brand, model, year, and price are required'
            });
        }

        // Create car
        const newCar = await Car.create({
            title: title.trim(),
            brand: brand.trim(),
            model: model.trim(),
            year: parseInt(year),
            price: parseInt(price),
            category,
            fuelType,
            transmission,
            color,
            mileage: mileage ? parseInt(mileage) : null,
            description,
            features: Array.isArray(features) ? features : [],
            images: Array.isArray(images) ? images : [],
            seller: userId
        });

        // Populate seller
        await newCar.populate('seller', 'name email avatarUrl phone');

        res.status(201).json({
            success: true,
            message: 'Car created successfully',
            data: newCar
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE CAR
 * PUT /api/cars/:id
 * Headers: Authorization: Bearer {token}
 * Body: { title, brand, model, year, price, ... }
 */
const updateCar = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const updates = req.body;

        // Find car and check ownership
        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        if (car.seller.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own listings'
            });
        }

        // Update allowed fields
        const allowedFields = ['title', 'brand', 'model', 'year', 'price', 'category', 'fuelType', 'transmission', 'color', 'mileage', 'description', 'features', 'images', 'status'];
        const updateData = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });

        const updatedCar = await Car.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('seller', 'name email avatarUrl phone');

        res.status(200).json({
            success: true,
            message: 'Car updated successfully',
            data: updatedCar
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE CAR
 * DELETE /api/cars/:id
 * Headers: Authorization: Bearer {token}
 */
const deleteCar = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Find car and check ownership
        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        if (car.seller.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own listings'
            });
        }

        // Delete car
        await Car.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Car deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET MY CARS (User's listings)
 * GET /api/cars/user/my-cars
 * Headers: Authorization: Bearer {token}
 */
const getMyCars = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const filter = { seller: userId };
        if (status) filter.status = status;

        const cars = await Car.find(filter)
            .populate('seller', 'name email avatarUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: cars,
            count: cars.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET POPULAR CARS (Most viewed)
 * GET /api/cars/popular
 */
const getPopularCars = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const cars = await Car.find({ status: 'available' })
            .populate('seller', 'name email avatarUrl phone')
            .sort({ views: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: cars
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET TRENDING CARS (Most viewed in last 7 days)
 * GET /api/cars/trending
 */
const getTrendingCars = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        // Calculate trending score: views in last 7 days / age in days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const cars = await Car.aggregate([
            {
                $match: {
                    status: 'available',
                    createdAt: { $lte: new Date() }
                }
            },
            {
                $addFields: {
                    ageInDays: {
                        $max: [
                            {
                                $divide: [
                                    { $subtract: [new Date(), '$createdAt'] },
                                    1000 * 60 * 60 * 24
                                ]
                            },
                            1
                        ]
                    },
                    trendingScore: '$views'
                }
            },
            {
                $sort: { trendingScore: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller'
                }
            },
            {
                $unwind: {
                    path: '$seller',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: cars
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
    getMyCars,
    getPopularCars,
    getTrendingCars
};