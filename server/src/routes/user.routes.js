const router = require('express').Router();
const userController = require('../controllers/user.controller');
const verifyJWT = require('../middleware/verifyJWT');

// ============================================
// PROTECTED ROUTES (Require JWT) - Specific routes BEFORE parameterized routes
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
 * UPLOAD AVATAR
 * POST /api/user/avatar
 * Headers: Authorization: Bearer {token}
 * Body: multipart/form-data { avatar }
 */
const upload = require('../middleware/upload');
router.post('/avatar', verifyJWT, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
            url: req.file.path,
            public_id: req.file.filename
        }
    });
});

// ============================================
// FAVORITES MANAGEMENT - Before parameterized routes
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

/**
 * DELETE USER ACCOUNT
 * DELETE /api/user/:id
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:id', verifyJWT, userController.deleteUser);

module.exports = router;