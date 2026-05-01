const router = require('express').Router();
const userController = require('../controllers/user.controller');
const verifyJWT = require('../middleware/verifyJWT');

// ============================================
// PROTECTED ROUTES (Require JWT)
// ============================================

/**
 * GET PROFILE
 * GET /api/user/profile
 * Headers: Authorization: Bearer {token}
 */
router.get('/profile', verifyJWT, userController.getProfile);

/**
 * UPDATE PROFILE
 * PUT /api/user/profile
 * Headers: Authorization: Bearer {token}
 * Body: { name, phone, avatarUrl }
 */
router.put('/profile', verifyJWT, userController.updateProfile);

/**
 * DELETE USER ACCOUNT
 * DELETE /api/user/:id
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:id', verifyJWT, userController.deleteUser);

// ============================================
// FAVORITES MANAGEMENT
// ============================================

/**
 * GET FAVORITES
 * GET /api/user/favorites
 * Headers: Authorization: Bearer {token}
 */
router.get('/favorites', verifyJWT, userController.getFavorites);

/**
 * ADD TO FAVORITES
 * POST /api/user/favorites/:carId
 * Headers: Authorization: Bearer {token}
 */
router.post('/favorites/:carId', verifyJWT, userController.addFavorite);

/**
 * REMOVE FROM FAVORITES
 * DELETE /api/user/favorites/:carId
 * Headers: Authorization: Bearer {token}
 */
router.delete('/favorites/:carId', verifyJWT, userController.removeFavorite);

module.exports = router;