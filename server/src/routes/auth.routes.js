const router = require('express').Router();
const passport = require('passport');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const authController = require('../controllers/auth.controller');
const verifyJWT = require('../middleware/verifyJWT');
const uploadErrorHandler = require('../middleware/upload');
require('../config/passport'); // Load passport strategies
require('dotenv').config();

// Configure Cloudinary for signup profile upload
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const signupStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'caryuk/profiles',
        format: async (req, file) => {
            const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const ext = file.originalname.split('.').pop().toLowerCase();
            return allowedFormats.includes(ext) ? ext : 'jpg';
        },
        public_id: (req, file) => {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            return `${timestamp}_${randomStr}`;
        },
        quality: 'auto:best'
    }
});

const signupUpload = multer({
    storage: signupStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format. Only JPEG, PNG, GIF, WebP allowed'));
        }
    }
});

// ============================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================

/**
 * SIGNUP - Create new account with profile picture
 * POST /api/auth/signup
 * Body: { name, email, password, confirmPassword, phone }
 * File: avatar (optional) - profile picture
 */
router.post('/signup', signupUpload.single('avatar'), uploadErrorHandler, authController.signup);

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