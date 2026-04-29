const mongoose = require('mongoose');
const dns = require('dns');

require('dotenv').config();

const connectDB = async() => {
    try {
        const mongoUri = process.env.MONGO_URI;
        console.log('Attempting to connect to MongoDB...');
        
        dns.setServers(["1.1.1.1", "8.8.8.8"])
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✓ MongoDB connected successfully');
    } catch (error) {
        console.error('✗ Error connecting to MongoDB:', error.message);
        console.error('\nTroubleshooting tips:');
        console.error('1. Ensure MongoDB Atlas cluster is running (check dashboard)');
        console.error('2. Check IP whitelist: Atlas → Network Access → add your IP');
        console.error('3. Verify MONGO_URI in .env file');
        console.error('4. Try removing directConnection=true from the connection string if it causes issues');
        process.exit(1);
    }
};

module.exports = { connectDB };