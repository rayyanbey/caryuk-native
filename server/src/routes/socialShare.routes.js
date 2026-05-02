const router = require('express').Router();
const socialShareController = require('../controllers/socialShare.controller');
const verifyJWT = require('../middleware/verifyJWT');

/**
 * TRACK SOCIAL SHARE
 * POST /api/social-share/:carId
 * Headers: Authorization: Bearer {token} (optional)
 * Body: { platform, shareUrl }
 */
router.post('/:carId', socialShareController.trackShare);

/**
 * GET SHARE STATS FOR CAR
 * GET /api/social-share/:carId/stats
 */
router.get('/:carId/stats', socialShareController.getShareStats);

/**
 * GET GLOBAL SHARE LEADERBOARD
 * GET /api/social-share/leaderboard
 * Query: { limit, platform }
 */
router.get('/leaderboard', socialShareController.getLeaderboard);

/**
 * GET MY SHARES
 * GET /api/social-share/my-shares
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit }
 */
router.get('/my-shares', verifyJWT, socialShareController.getMyShares);

module.exports = router;
