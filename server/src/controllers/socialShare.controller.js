const SocialShare = require('../models/socialShare.model');
const Car = require('../models/car.model');

/**
 * TRACK SOCIAL SHARE
 * POST /api/social-share/:carId
 * Headers: Authorization: Bearer {token} (optional)
 * Body: { platform, shareUrl }
 */
const trackShare = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const { platform, shareUrl } = req.body;
        const sharedBy = req.userId || null;

        // Validate platform
        const validPlatforms = ['facebook', 'whatsapp', 'instagram', 'twitter', 'other'];
        if (!platform || !validPlatforms.includes(platform.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid platform. Must be one of: facebook, whatsapp, instagram, twitter, other'
            });
        }

        // Verify car exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Record share
        const share = new SocialShare({
            car: carId,
            platform: platform.toLowerCase(),
            sharedBy,
            shareUrl: shareUrl || null,
            metadata: {
                userAgent: req.headers['user-agent'] || null,
                ipAddress: req.ip || null
            }
        });

        await share.save();

        res.status(201).json({
            success: true,
            message: `Shared on ${platform}`,
            data: share
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET SHARE STATS FOR CAR
 * GET /api/social-share/:carId/stats
 */
const getShareStats = async (req, res, next) => {
    try {
        const { carId } = req.params;

        // Verify car exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Get share statistics
        const stats = await SocialShare.aggregate([
            {
                $match: { car: require('mongoose').Types.ObjectId(carId) }
            },
            {
                $group: {
                    _id: '$platform',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalShares = await SocialShare.countDocuments({ car: carId });

        // Get recent shares (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentShares = await SocialShare.countDocuments({
            car: carId,
            timestamp: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                carId,
                totalShares,
                sharesInLast7Days: recentShares,
                sharesByPlatform: stats
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET ALL SHARES FOR USER (if logged in)
 * GET /api/social-share/my-shares
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit }
 */
const getMyShares = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const total = await SocialShare.countDocuments({ sharedBy: userId });
        const shares = await SocialShare.find({ sharedBy: userId })
            .populate('car', 'title brand model price images')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: shares,
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
 * GET GLOBAL SHARE LEADERBOARD
 * GET /api/social-share/leaderboard
 * Query: { limit, platform }
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 10, platform } = req.query;

        const match = platform ? { platform: platform.toLowerCase() } : {};

        const leaderboard = await SocialShare.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$car',
                    totalShares: { $sum: 1 },
                    platforms: { $addToSet: '$platform' }
                }
            },
            {
                $sort: { totalShares: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'cars',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'carDetails'
                }
            },
            {
                $unwind: {
                    path: '$carDetails',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    trackShare,
    getShareStats,
    getMyShares,
    getLeaderboard
};
