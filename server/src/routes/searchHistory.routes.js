const router = require('express').Router();
const searchHistoryController = require('../controllers/searchHistory.controller');
const verifyJWT = require('../middleware/verifyJWT');

/**
 * SAVE SEARCH
 * POST /api/search-history
 * Headers: Authorization: Bearer {token}
 * Body: { query, filters, resultCount }
 */
router.post('/', verifyJWT, searchHistoryController.saveSearch);

/**
 * GET SEARCH HISTORY
 * GET /api/search-history
 * Headers: Authorization: Bearer {token}
 * Query: { limit }
 */
router.get('/', verifyJWT, searchHistoryController.getSearchHistory);

/**
 * GET TRENDING SEARCHES
 * GET /api/search-history/trending/global
 * Query: { limit }
 */
router.get('/trending/global', searchHistoryController.getTrendingSearches);

/**
 * DELETE SINGLE SEARCH
 * DELETE /api/search-history/:id
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:id', verifyJWT, searchHistoryController.deleteSearch);

/**
 * CLEAR ALL SEARCH HISTORY
 * DELETE /api/search-history
 * Headers: Authorization: Bearer {token}
 */
router.delete('/', verifyJWT, searchHistoryController.clearHistory);

module.exports = router;
