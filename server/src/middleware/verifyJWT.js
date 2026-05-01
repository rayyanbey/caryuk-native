const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * JWT verification middleware
 * Extracts and verifies JWT token from Authorization header
 * Sets req.user with decoded token data
 */
const verifyJWT = async (req, res, next) => {
    try {
        // Extract token from Bearer scheme
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        // Attach user to request
        req.user = decoded;
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }
        
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

module.exports = verifyJWT;