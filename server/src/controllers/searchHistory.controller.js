const SearchHistory = require('../models/searchHistory.model');
const Car = require('../models/car.model');

/**
 * SAVE SEARCH
 * POST /api/search-history
 * Headers: Authorization: Bearer {token}
 * Body: { query, filters, resultCount }
 */
const saveSearch = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { query, filters, resultCount } = req.body;

        const searchEntry = new SearchHistory({
            userId,
            query: query || null,
            filters: filters || {},
            resultCount: resultCount || 0
        });

        await searchEntry.save();

        res.status(201).json({
            success: true,
            message: 'Search saved to history',
            data: searchEntry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET SEARCH HISTORY
 * GET /api/search-history
 * Headers: Authorization: Bearer {token}
 * Query: { limit }
 */
const getSearchHistory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { limit = 15 } = req.query;

        const searches = await SearchHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: searches
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET TRENDING SEARCHES
 * GET /api/search-history/trending/global
 * Query: { limit }
 */
const getTrendingSearches = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        // Get searches from last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const trending = await SearchHistory.aggregate([
            {
                $match: { createdAt: { $gte: sevenDaysAgo } }
            },
            {
                $group: {
                    _id: '$query',
                    count: { $sum: 1 },
                    resultCount: { $avg: '$resultCount' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.status(200).json({
            success: true,
            data: trending
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE SINGLE SEARCH
 * DELETE /api/search-history/:id
 * Headers: Authorization: Bearer {token}
 */
const deleteSearch = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const search = await SearchHistory.findByIdAndDelete(id);

        if (!search) {
            return res.status(404).json({
                success: false,
                error: 'Search not found'
            });
        }

        if (search.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Search deleted'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CLEAR ALL SEARCH HISTORY
 * DELETE /api/search-history
 * Headers: Authorization: Bearer {token}
 */
const clearHistory = async (req, res, next) => {
    try {
        const userId = req.userId;

        await SearchHistory.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: 'Search history cleared'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    saveSearch,
    getSearchHistory,
    getTrendingSearches,
    deleteSearch,
    clearHistory
};
