const router = require('express').Router();
const recommendationController = require('../controllers/recommendation.controller');
const verifyJWT = require('../middleware/verifyJWT');

/**
 * GET RECOMMENDATIONS
 * GET /api/recommendations
 * Headers: Authorization: Bearer {token}
 * Query: { limit }
 */
router.get('/', verifyJWT, recommendationController.getRecommendations);

/**
 * GET RECOMMENDATION STATS
 * GET /api/recommendations/stats
 * Headers: Authorization: Bearer {token}
 */
router.get('/stats', verifyJWT, recommendationController.getRecommendationStats);

/**
 * REGENERATE RECOMMENDATIONS
 * POST /api/recommendations/regenerate
 * Headers: Authorization: Bearer {token}
 */
router.post('/regenerate', verifyJWT, recommendationController.regenerateRecommendations);

module.exports = router;
