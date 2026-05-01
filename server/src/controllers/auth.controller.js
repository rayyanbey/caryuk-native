const User = require('../models/user.model');
const { generateToken, generateRefreshToken } = require('../utils/authService');
require('dotenv').config();

/**
 * SIGNUP - Email/Password Registration
 * POST /api/auth/signup
 * Body: { name, email, password, confirmPassword }
 */
const signup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Create new user
        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: password,
            provider: 'local'
        });

        // Generate tokens
        const token = newUser.generateToken();
        const refreshToken = generateRefreshToken(newUser);

        // Update last login
        newUser.lastLogin = new Date();
        await newUser.save();

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token: token,
                refreshToken: refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * LOGIN - Email/Password Login
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if user has password (local provider)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                error: 'Please sign in with your OAuth provider',
                provider: user.provider
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const token = user.generateToken();
        const refreshToken = generateRefreshToken(user);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: userResponse,
                token: token,
                refreshToken: refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GOOGLE LOGIN/SIGNUP
 * GET /api/auth/google
 * Redirect to: GET /api/auth/google/callback
 */
const googleCallback = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed'
            });
        }

        const token = req.user.generateToken();
        const refreshToken = generateRefreshToken(req.user);

        // Update last login
        req.user.lastLogin = new Date();
        await req.user.save();

        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth-success?token=${token}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
};

/**
 * LOGOUT
 * POST /api/auth/logout
 * Headers: Authorization: Bearer {token}
 */
const logout = async (req, res, next) => {
    try {
        // In JWT, logout is typically handled on frontend by removing token
        // Backend can optionally invalidate token by adding to blacklist
        // For now, just send success response

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET CURRENT USER
 * GET /api/auth/me
 * Headers: Authorization: Bearer {token}
 */
const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * REFRESH TOKEN
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 */
const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '_refresh');
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const newToken = user.generateToken();

            res.status(200).json({
                success: true,
                data: {
                    token: newToken
                }
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE PROFILE
 * PUT /api/auth/profile
 * Headers: Authorization: Bearer {token}
 * Body: { name, phone, avatarUrl }
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const userId = req.userId;

        // Find and update user
        const user = await User.findByIdAndUpdate(
            userId,
            {
                ...(name && { name: name.trim() }),
                ...(phone && { phone: phone.trim() })
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CHANGE PASSWORD
 * POST /api/auth/change-password
 * Headers: Authorization: Bearer {token}
 * Body: { oldPassword, newPassword, confirmPassword }
 */
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const userId = req.userId;

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Get user with password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify old password
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    signup,
    login,
    logout,
    googleCallback,
    getCurrentUser,
    refreshAccessToken,
    updateProfile,
    changePassword
};