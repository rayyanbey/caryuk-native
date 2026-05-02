require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Import models
const User = require('../models/user.model');
const Car = require('../models/car.model');
const Order = require('../models/order.model');
const Voucher = require('../models/voucher.model');
const Notification = require('../models/notification.model');
const SearchHistory = require('../models/searchHistory.model');
const Cart = require('../models/cart.model');
const Contact = require('../models/contact.model');
const Recommendation = require('../models/recommendation.model');
const SocialShare = require('../models/socialShare.model');

const MONGO_URI = process.env.MONGO_URI;

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
         dns.setServers(["1.1.1.1", "8.8.8.8"])

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('✓ MongoDB connected');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

/**
 * Clear all collections
 */
const clearDatabase = async () => {
    try {
        console.log('\n🧹 Clearing database...\n');
        
        await connectDB();
        
        const userCount = await User.deleteMany({});
        console.log(`✓ Deleted ${userCount.deletedCount} users`);
        
        const carCount = await Car.deleteMany({});
        console.log(`✓ Deleted ${carCount.deletedCount} cars`);
        
        const orderCount = await Order.deleteMany({});
        console.log(`✓ Deleted ${orderCount.deletedCount} orders`);
        
        const voucherCount = await Voucher.deleteMany({});
        console.log(`✓ Deleted ${voucherCount.deletedCount} vouchers`);
        
        const notificationCount = await Notification.deleteMany({});
        console.log(`✓ Deleted ${notificationCount.deletedCount} notifications`);
        
        const searchCount = await SearchHistory.deleteMany({});
        console.log(`✓ Deleted ${searchCount.deletedCount} search history entries`);
        
        const cartCount = await Cart.deleteMany({});
        console.log(`✓ Deleted ${cartCount.deletedCount} carts`);
        
        const contactCount = await Contact.deleteMany({});
        console.log(`✓ Deleted ${contactCount.deletedCount} contacts`);
        
        const recommendationCount = await Recommendation.deleteMany({});
        console.log(`✓ Deleted ${recommendationCount.deletedCount} recommendations`);
        
        const socialShareCount = await SocialShare.deleteMany({});
        console.log(`✓ Deleted ${socialShareCount.deletedCount} social shares`);
        
        console.log('\n✅ Database cleared successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Error clearing database:', error.message);
        process.exit(1);
    }
};

// Run clearing
clearDatabase();
