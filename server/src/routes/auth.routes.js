const router = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const verifyJWT = require('../middleware/verifyJWT');
require('../config/passport'); // Load passport strategies

// ============================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================

/**
 * SIGNUP - Create new account
 * POST /api/auth/signup
 * Body: { name, email, password, confirmPassword }
 */
router.post('/signup', authController.signup);

/**
 * LOGIN - Login with email/password
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', authController.login);

// ============================================
// GOOGLE OAUTH
// ============================================

/**
 * Google OAuth - Initiate login
 * GET /api/auth/google
 */
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * Google OAuth - Callback
 * GET /api/auth/google/callback
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/failure', session: false }),
    authController.googleCallback
);

// ============================================
// PROTECTED ROUTES (Require JWT)
// ============================================

/**
 * LOGOUT - Invalidate session
 * POST /api/auth/logout
 * Headers: Authorization: Bearer {token}
 */
router.post('/logout', verifyJWT, authController.logout);

/**
 * GET CURRENT USER
 * GET /api/auth/me
 * Headers: Authorization: Bearer {token}
 */
router.get('/me', verifyJWT, authController.getCurrentUser);

/**
 * REFRESH TOKEN - Get new access token
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 */
router.post('/refresh-token', authController.refreshAccessToken);

/**
 * UPDATE PROFILE
 * PUT /api/auth/profile
 * Headers: Authorization: Bearer {token}
 * Body: { name, phone }
 */
router.put('/profile', verifyJWT, authController.updateProfile);

/**
 * CHANGE PASSWORD
 * POST /api/auth/change-password
 * Headers: Authorization: Bearer {token}
 * Body: { oldPassword, newPassword, confirmPassword }
 */
router.post('/change-password', verifyJWT, authController.changePassword);

// ============================================
// ERROR ROUTES
// ============================================

router.get('/google/failure', (req, res) => {
    res.status(401).json({
        success: false,
        error: 'Google authentication failed'
    });
});

module.exports = router;