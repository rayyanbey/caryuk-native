const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // Increased for development
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Passport Configuration
app.use(passport.initialize());

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const carsRoutes = require('./routes/cars.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentRoutes = require('./routes/payment.routes');
const userRoutes = require('./routes/user.routes');
const voucherRoutes = require('./routes/voucher.routes');
const searchHistoryRoutes = require('./routes/searchHistory.routes');
const cartRoutes = require('./routes/cart.routes');
const contactRoutes = require('./routes/contact.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const socialShareRoutes = require('./routes/socialShare.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/social-share', socialShareRoutes);

// 404 Handler (catch all unmatched routes)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handling Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;