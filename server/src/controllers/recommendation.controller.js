const Recommendation = require('../models/recommendation.model');
const User = require('../models/user.model');
const Car = require('../models/car.model');

/**
 * GET RECOMMENDATIONS
 * GET /api/recommendations
 * Headers: Authorization: Bearer {token}
 * Query: { limit }
 */
const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { limit = 10 } = req.query;

        // Get user's favorite cars to understand preferences
        const user = await User.findById(userId).populate({
            path: 'favourites',
            select: 'category brand price fuelType views'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const favoriteCategories = {};
        const favoriteBrands = {};
        let totalFavoritePrice = 0;

        // Analyze favorites to understand user preferences
        user.favourites.forEach(car => {
            favoriteCategories[car.category] = (favoriteCategories[car.category] || 0) + 1;
            favoriteBrands[car.brand] = (favoriteBrands[car.brand] || 0) + 1;
            totalFavoritePrice += car.price;
        });

        const avgPrice = user.favourites.length > 0 ? totalFavoritePrice / user.favourites.length : 0;
        const mostLikedCategory = Object.keys(favoriteCategories).length > 0
            ? Object.keys(favoriteCategories).reduce((a, b) => favoriteCategories[a] > favoriteCategories[b] ? a : b)
            : null;
        const mostLikedBrand = Object.keys(favoriteBrands).length > 0
            ? Object.keys(favoriteBrands).reduce((a, b) => favoriteBrands[a] > favoriteBrands[b] ? a : b)
            : null;

        // Get cars to recommend
        const priceRange = avgPrice * 0.2; // 20% price tolerance
        const recommendedCars = await Car.find({
            status: 'available',
            _id: { $nin: user.favourites } // Exclude already favorited
        })
            .populate('seller', 'name avatarUrl')
            .limit(limit * 3); // Get extra to filter through

        const recommendations = [];

        for (const car of recommendedCars) {
            let score = 0;
            let reason = '';

            // Scoring algorithm
            // 1. Same category as favorites (40 points)
            if (mostLikedCategory && car.category === mostLikedCategory) {
                score += 40;
                reason = 'similar_category';
            }

            // 2. Same brand as favorites (35 points)
            if (mostLikedBrand && car.brand === mostLikedBrand) {
                score += 35;
                reason = 'same_brand';
            }

            // 3. Similar price to favorites (30 points)
            if (avgPrice > 0 && Math.abs(car.price - avgPrice) <= priceRange) {
                score += 30;
                reason = reason || 'similar_price';
            }

            // 4. Trending (high views) (25 points)
            if (car.views > 50) {
                score += 25;
                reason = reason || 'trending';
            }

            // 5. Popular (high views overall) (20 points)
            if (car.views > 100) {
                score += 20;
                reason = reason || 'popular';
            }

            // Only include if score > 0
            if (score > 0) {
                recommendations.push({
                    car: car._id,
                    carData: car,
                    score,
                    reason
                });
            }
        }

        // Sort by score and take top {limit}
        recommendations.sort((a, b) => b.score - a.score);
        const topRecommendations = recommendations.slice(0, parseInt(limit));

        // Save recommendations to DB for tracking
        const recordsToSave = topRecommendations.map(rec => ({
            userId,
            recommendedCar: rec.car,
            reason: rec.reason,
            score: rec.score
        }));

        await Recommendation.insertMany(recordsToSave);

        res.status(200).json({
            success: true,
            data: topRecommendations.map(rec => ({
                _id: rec.car,
                ...rec.carData.toObject(),
                recommendationScore: rec.score,
                recommendationReason: rec.reason
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * REGENERATE RECOMMENDATIONS
 * POST /api/recommendations/regenerate
 * Headers: Authorization: Bearer {token}
 */
const regenerateRecommendations = async (req, res, next) => {
    try {
        const userId = req.userId;

        // Clear old recommendations (older than 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        await Recommendation.deleteMany({
            userId,
            generatedAt: { $lt: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            message: 'Old recommendations cleared. Fetch new recommendations with GET /api/recommendations'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET RECOMMENDATION STATS
 * GET /api/recommendations/stats
 * Headers: Authorization: Bearer {token}
 */
const getRecommendationStats = async (req, res, next) => {
    try {
        const userId = req.userId;

        const stats = await Recommendation.aggregate([
            {
                $match: { userId: require('mongoose').Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: '$reason',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$score' }
                }
            }
        ]);

        const totalRecs = await Recommendation.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: {
                totalRecommendations: totalRecs,
                byReason: stats
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecommendations,
    regenerateRecommendations,
    getRecommendationStats
};
