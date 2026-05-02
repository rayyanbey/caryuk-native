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

// Import auth service
const { hashPassword } = require('../utils/authService');

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
const clearCollections = async () => {
    try {
        await User.deleteMany({});
        await Car.deleteMany({});
        await Order.deleteMany({});
        await Voucher.deleteMany({});
        await Notification.deleteMany({});
        await SearchHistory.deleteMany({});
        await Cart.deleteMany({});
        await Contact.deleteMany({});
        await Recommendation.deleteMany({});
        await SocialShare.deleteMany({});
        console.log('✓ Collections cleared');
    } catch (error) {
        console.error('✗ Error clearing collections:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Users
 */
const seedUsers = async () => {
    try {
        const users = [
            // Sellers
            {
                name: 'Ahmed Hassan',
                email: 'ahmed@example.com',
                password: 'password123',
                phone: '+923001234567',
                provider: 'local',
                avatarUrl: 'https://i.pravatar.cc/150?img=1',
                isActive: true
            },
            {
                name: 'Fatima Ali',
                email: 'fatima@example.com',
                password: 'password123',
                phone: '+923009876543',
                provider: 'local',
                avatarUrl: 'https://i.pravatar.cc/150?img=2',
                isActive: true
            },
            {
                name: 'Muhammad Khan',
                email: 'khan@example.com',
                password: 'password123',
                phone: '+923005555555',
                provider: 'local',
                avatarUrl: 'https://i.pravatar.cc/150?img=3',
                isActive: true
            },
            // Buyers
            {
                name: 'Ayesha Ahmed',
                email: 'ayesha@example.com',
                password: 'password123',
                phone: '+923012345678',
                provider: 'local',
                avatarUrl: 'https://i.pravatar.cc/150?img=4',
                isActive: true
            },
            {
                name: 'Hassan Khan',
                email: 'hassan@example.com',
                password: 'password123',
                phone: '+923011111111',
                provider: 'local',
                avatarUrl: 'https://i.pravatar.cc/150?img=5',
                isActive: true
            },
            {
                name: 'Zainab Malik',
                email: 'zainab@example.com',
                password: 'password123',
                phone: '+923013333333',
                provider: 'local',
                avatarUrl: 'https://i.pravatar.cc/150?img=6',
                isActive: true
            }
        ];

        const createdUsers = await User.create(users);
        console.log(`✓ Seeded ${createdUsers.length} users`);
        return createdUsers;
    } catch (error) {
        console.error('✗ Error seeding users:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Cars (linked to sellers)
 */
const seedCars = async (users) => {
    try {
        const sellers = users.slice(0, 3); // First 3 users are sellers
        
        const cars = [
            // Ahmed's cars
            {
                title: '2022 Honda Civic 1.8 Automatic',
                brand: 'Honda',
                model: 'Civic',
                year: 2022,
                color: 'Silver',
                price: 2500000,
                category: 'Sedan',
                fuelType: 'Petrol',
                transmission: 'Auto',
                mileage: 15000,
                description: 'Well-maintained Honda Civic with full service history. All original parts.',
                features: ['AC', 'Power Steering', 'Power Windows', 'ABS', 'Airbags'],
                images: [
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500',
                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
                ],
                seller: sellers[0]._id,
                status: 'available',
                views: 0
            },
            {
                title: '2020 Toyota Corolla 1.6 Manual',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                color: 'White',
                price: 1800000,
                category: 'Sedan',
                fuelType: 'Petrol',
                transmission: 'Manual',
                mileage: 45000,
                description: 'Reliable Toyota Corolla, fuel efficient, perfect for daily use.',
                features: ['AC', 'Power Steering', 'ABS'],
                images: [
                    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500'
                ],
                seller: sellers[0]._id,
                status: 'available',
                views: 0
            },
            // Fatima's cars
            {
                title: '2019 Suzuki Alto 800CC Manual',
                brand: 'Suzuki',
                model: 'Alto',
                year: 2019,
                color: 'Red',
                price: 1200000,
                category: 'Hatchback',
                fuelType: 'Petrol',
                transmission: 'Manual',
                mileage: 60000,
                description: 'Budget-friendly Suzuki Alto, low maintenance, great for first-time buyers.',
                features: ['AC', 'Power Steering'],
                images: [
                    'https://images.unsplash.com/photo-1552819254-1bae2f44e3c1?w=500'
                ],
                seller: sellers[1]._id,
                status: 'available',
                views: 0
            },
            {
                title: '2021 Hyundai Tucson 2.0 Automatic',
                brand: 'Hyundai',
                model: 'Tucson',
                year: 2021,
                color: 'Black',
                price: 3200000,
                category: 'SUV',
                fuelType: 'Petrol',
                transmission: 'Auto',
                mileage: 25000,
                description: 'Spacious Hyundai SUV with modern features and good fuel efficiency.',
                features: ['AC', 'Power Windows', 'ABS', 'Airbags', 'Sunroof', 'Bluetooth'],
                images: [
                    'https://images.unsplash.com/photo-1606611013016-969c19d4a91f?w=500'
                ],
                seller: sellers[1]._id,
                status: 'available',
                views: 0
            },
            // Muhammad's cars
            {
                title: '2023 Toyota Fortuner 2.8 Manual',
                brand: 'Toyota',
                model: 'Fortuner',
                year: 2023,
                color: 'White',
                price: 4500000,
                category: 'SUV',
                fuelType: 'Diesel',
                transmission: 'Manual',
                mileage: 8000,
                description: 'Premium Toyota SUV with excellent off-road capabilities.',
                features: ['AC', 'Power Windows', 'ABS', 'Airbags', 'Sunroof', '4WD', 'Bluetooth'],
                images: [
                    'https://images.unsplash.com/photo-1605559424843-9e4c3dec3271?w=500'
                ],
                seller: sellers[2]._id,
                status: 'available',
                views: 0
            },
            {
                title: '2018 Nissan Qashqai 2.0 Automatic',
                brand: 'Nissan',
                model: 'Qashqai',
                year: 2018,
                color: 'Gray',
                price: 2800000,
                category: 'SUV',
                fuelType: 'Petrol',
                transmission: 'Auto',
                mileage: 75000,
                description: 'Sporty Nissan SUV with excellent comfort and safety features.',
                features: ['AC', 'Power Windows', 'ABS', 'Airbags', 'Bluetooth'],
                images: [
                    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500'
                ],
                seller: sellers[2]._id,
                status: 'available',
                views: 0
            }
        ];

        const createdCars = await Car.create(cars);
        console.log(`✓ Seeded ${createdCars.length} cars`);
        return createdCars;
    } catch (error) {
        console.error('✗ Error seeding cars:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Vouchers
 */
const seedVouchers = async () => {
    try {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const vouchers = [
            {
                code: 'SAVE10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderAmount: 500000,
                expiresAt: expiryDate,
                isActive: true,
                usageLimit: 100,
                usedCount: 0,
                usedBy: []
            },
            {
                code: 'FLAT500',
                discountType: 'flat',
                discountValue: 500000,
                minOrderAmount: 2000000,
                maxDiscountCap: 500000,
                expiresAt: expiryDate,
                isActive: true,
                usageLimit: 50,
                usedCount: 0,
                usedBy: []
            },
            {
                code: 'WELCOME15',
                discountType: 'percentage',
                discountValue: 15,
                minOrderAmount: 1000000,
                maxDiscountCap: 300000,
                expiresAt: expiryDate,
                isActive: true,
                usageLimit: 200,
                usedCount: 0,
                usedBy: []
            },
            {
                code: 'SUMMER20',
                discountType: 'percentage',
                discountValue: 20,
                minOrderAmount: 1500000,
                maxDiscountCap: 400000,
                expiresAt: expiryDate,
                isActive: true,
                usageLimit: 75,
                usedCount: 0,
                usedBy: []
            },
            {
                code: 'FLAT1000',
                discountType: 'flat',
                discountValue: 1000000,
                minOrderAmount: 3000000,
                expiresAt: expiryDate,
                isActive: true,
                usageLimit: 30,
                usedCount: 0,
                usedBy: []
            }
        ];

        const createdVouchers = await Voucher.create(vouchers);
        console.log(`✓ Seeded ${createdVouchers.length} vouchers`);
        return createdVouchers;
    } catch (error) {
        console.error('✗ Error seeding vouchers:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Orders (linked to buyers, cars, and vouchers)
 */
const seedOrders = async (users, cars, vouchers) => {
    try {
        const buyers = users.slice(3); // Users 4, 5, 6 are buyers
        
        const orders = [
            {
                buyer: buyers[0]._id,
                car: cars[0]._id,
                amount: 2500000,
                discountAmount: 0,
                voucherCode: null,
                status: 'paid',
                stripePaymentId: 'pi_test_001'
            },
            {
                buyer: buyers[1]._id,
                car: cars[2]._id,
                amount: 1080000,
                discountAmount: 120000,
                voucherCode: 'SAVE10',
                status: 'paid',
                stripePaymentId: 'pi_test_002'
            },
            {
                buyer: buyers[2]._id,
                car: cars[3]._id,
                amount: 3040000,
                discountAmount: 160000,
                voucherCode: 'WELCOME15',
                status: 'paid',
                stripePaymentId: 'pi_test_003'
            },
            {
                buyer: buyers[0]._id,
                car: cars[1]._id,
                amount: 1800000,
                discountAmount: 0,
                voucherCode: null,
                status: 'pending'
            },
            {
                buyer: buyers[1]._id,
                car: cars[4]._id,
                amount: 4050000,
                discountAmount: 450000,
                voucherCode: 'SUMMER20',
                status: 'cancelled'
            },
            {
                buyer: buyers[2]._id,
                car: cars[5]._id,
                amount: 2800000,
                discountAmount: 0,
                voucherCode: null,
                status: 'pending'
            }
        ];

        const createdOrders = await Order.create(orders);
        console.log(`✓ Seeded ${createdOrders.length} orders`);
        return createdOrders;
    } catch (error) {
        console.error('✗ Error seeding orders:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Notifications (linked to users) - Duolingo Pakistan Style with FOMO
 */
const seedNotifications = async (users) => {
    try {
        const notifications = [
            {
                userId: users[3]._id,
                title: '⏰ Deal Pakka - LAST 2 HOURS! 🎉',
                body: 'Badshah! Tera Honda Civic ki deal confirm ho gai! Payment na kiya tou Hassan 30 min mein cancel kar dega! Jaldi!',
                type: 'order_update',
                read: false
            },
            {
                userId: users[3]._id,
                title: '🔥 Sirf 1 Toyota Fortuner Bacha! 🚗',
                body: 'Naya Toyota Fortuner aa gaya! Yeh toh tera hi dua tha na? Fatima ne bhi dekha hai... jaldi se khareed le!',
                type: 'new_listing',
                read: false
            },
            {
                userId: users[4]._id,
                title: '⚡ FLASH SALE - SIRF 4 GHANTE! 💨',
                body: 'Suzuki Alto pe 50,000 ka discount! 47 log ne dekha aaj... 3 already intezaar kar rahe hain. Tum kya kar rahe ho?',
                type: 'price_drop',
                read: true
            },
            {
                userId: users[5]._id,
                title: '🚨 EMERGENCY - Paise Waste Ho Rahe Hain! 🇵🇰',
                body: 'SUMMER20 code - 20% off SUVs! Sirf AAJKE LIYE! 89 users ne pehle se use kar liya... tu kya kar rahe? 18 GHANTE BAAKI!',
                type: 'promo',
                read: false
            },
            {
                userId: users[0]._id,
                title: '💰 CONGRATS BHAI! 🎊',
                body: 'Tera Honda Civic bik gaya! Ayesha ne order kar dia! 🔥 3 log aur intezaar kar rahe the! Tu lucky nikla!',
                type: 'order_update',
                read: true
            },
            {
                userId: users[1]._id,
                title: '💸 PAISE AA GAYE! AAJKA 5TH SALE! 🎯',
                body: 'Suzuki Alto payment confirmed! Tere sales aaj 5 ban gaye! Nabil ke paas sirf 2 hain😂 Apna namuna likha de!',
                type: 'order_update',
                read: true
            },
            {
                userId: users[2]._id,
                title: '⚠️ SERVER DOWN होने WALA! PEHLE ORDER KAR! 🔧',
                body: 'May 3rd 2-4 AM - Maintenance! 156 orders pending hain! Abb order kar varna queue mein 500 din intezaar karna padega!',
                type: 'system',
                read: false
            },
            {
                userId: users[4]._id,
                title: '😱 TU AKELA REH GAYA! 📊',
                body: 'Caryuk pe 4,286 cars listed hain aur tu abhi bhi dekh hi nahi raha? Nabil - 8 cars, Khan - 5 cars, tu - ZERO! 🤦',
                type: 'system',
                read: true
            }
        ];

        const createdNotifications = await Notification.create(notifications);
        console.log(`✓ Seeded ${createdNotifications.length} notifications`);
        return createdNotifications;
    } catch (error) {
        console.error('✗ Error seeding notifications:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Search History
 */
const seedSearchHistory = async (users) => {
    try {
        const searchQueries = [
            { query: 'Honda Civic', filters: { category: 'Sedan' } },
            { query: 'SUV under 3 million', filters: { category: 'SUV', maxPrice: 3000000 } },
            { query: 'White Corolla', filters: { brand: 'Toyota', color: 'White' } },
            { query: 'Automatic transmission', filters: { transmission: 'Auto' } },
            { query: 'Petrol cars', filters: { fuelType: 'Petrol' } }
        ];

        const searches = [];
        users.slice(3, 6).forEach((user, index) => {
            searchQueries.forEach((sq, queryIndex) => {
                searches.push({
                    userId: user._id,
                    query: sq.query,
                    filters: sq.filters,
                    resultCount: Math.floor(Math.random() * 50) + 1
                });
            });
        });

        await SearchHistory.create(searches);
        console.log(`✓ Seeded ${searches.length} search history entries`);
        return searches;
    } catch (error) {
        console.error('✗ Error seeding search history:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Carts
 */
const seedCarts = async (users, cars) => {
    try {
        const buyers = users.slice(3, 6);
        const carts = [];

        // Cart 1: Multiple items
        carts.push({
            userId: buyers[0]._id,
            items: [
                { car: cars[1]._id, notes: 'Call before visiting' },
                { car: cars[3]._id, notes: '' }
            ],
            appliedVoucher: 'SAVE10',
            discountAmount: 180000
        });

        // Cart 2: Single item
        carts.push({
            userId: buyers[1]._id,
            items: [
                { car: cars[4]._id, notes: 'Need for weekend' }
            ],
            appliedVoucher: null,
            discountAmount: 0
        });

        // Cart 3: Multiple items
        carts.push({
            userId: buyers[2]._id,
            items: [
                { car: cars[2]._id },
                { car: cars[5]._id }
            ],
            appliedVoucher: null,
            discountAmount: 0
        });

        await Cart.create(carts);
        console.log(`✓ Seeded ${carts.length} carts`);
        return carts;
    } catch (error) {
        console.error('✗ Error seeding carts:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Contact History
 */
const seedContacts = async (users, cars) => {
    try {
        const buyers = users.slice(3, 6);
        const sellers = users.slice(0, 3);

        const contacts = [
            {
                initiator: buyers[0]._id,
                recipient: sellers[0]._id,
                car: cars[0]._id,
                contactMethod: 'phone',
                recipientPhone: sellers[0].phone,
                status: 'completed'
            },
            {
                initiator: buyers[1]._id,
                recipient: sellers[1]._id,
                car: cars[2]._id,
                contactMethod: 'sms',
                recipientPhone: sellers[1].phone,
                message: 'Hi, is this car still available?',
                status: 'initiated'
            },
            {
                initiator: buyers[2]._id,
                recipient: sellers[2]._id,
                car: cars[4]._id,
                contactMethod: 'phone',
                recipientPhone: sellers[2].phone,
                status: 'completed'
            },
            {
                initiator: buyers[0]._id,
                recipient: sellers[1]._id,
                car: cars[3]._id,
                contactMethod: 'sms',
                recipientPhone: sellers[1].phone,
                message: 'Can we negotiate on price?',
                status: 'initiated'
            }
        ];

        await Contact.create(contacts);
        console.log(`✓ Seeded ${contacts.length} contact logs`);
        return contacts;
    } catch (error) {
        console.error('✗ Error seeding contacts:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Recommendations
 */
const seedRecommendations = async (users, cars) => {
    try {
        const buyers = users.slice(3, 6);
        const recommendations = [];

        // Create recommendations for each buyer
        buyers.forEach((buyer, buyerIndex) => {
            const reasons = ['similar_category', 'same_brand', 'similar_price', 'trending', 'popular'];
            
            // Create 5 recommendations per buyer
            for (let i = 0; i < 5; i++) {
                const carIndex = (buyerIndex * 2 + i) % cars.length;
                recommendations.push({
                    userId: buyer._id,
                    recommendedCar: cars[carIndex]._id,
                    reason: reasons[i % reasons.length],
                    score: Math.floor(Math.random() * 40) + 60 // 60-100 score
                });
            }
        });

        await Recommendation.create(recommendations);
        console.log(`✓ Seeded ${recommendations.length} recommendations`);
        return recommendations;
    } catch (error) {
        console.error('✗ Error seeding recommendations:', error.message);
        process.exit(1);
    }
};

/**
 * Seed Social Shares
 */
const seedSocialShares = async (users, cars) => {
    try {
        const platforms = ['facebook', 'whatsapp', 'instagram', 'twitter'];
        const shares = [];

        cars.forEach((car, carIndex) => {
            // Each car gets 3-5 shares on different platforms
            const shareCount = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < shareCount; i++) {
                shares.push({
                    car: car._id,
                    platform: platforms[Math.floor(Math.random() * platforms.length)],
                    sharedBy: users[Math.floor(Math.random() * users.length)]._id,
                    shareUrl: `https://caryuk.com/cars/${car._id}`,
                    metadata: {
                        userAgent: 'Mozilla/5.0',
                        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255)
                    }
                });
            }
        });

        await SocialShare.create(shares);
        console.log(`✓ Seeded ${shares.length} social shares`);
        return shares;
    } catch (error) {
        console.error('✗ Error seeding social shares:', error.message);
        process.exit(1);
    }
};

/**
 * Main seed function
 */
const seedDatabase = async () => {
    try {
        console.log('\n🌱 Starting database seeding...\n');
        
        await connectDB();
        await clearCollections();
        
        const users = await seedUsers();
        const cars = await seedCars(users);
        const vouchers = await seedVouchers();
        await seedOrders(users, cars, vouchers);
        await seedNotifications(users);
        await seedSearchHistory(users);
        await seedCarts(users, cars);
        await seedContacts(users, cars);
        await seedRecommendations(users, cars);
        await seedSocialShares(users, cars);
        
        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Seeded Data Summary:');
        console.log('   • Users: 6 (3 sellers, 3 buyers)');
        console.log('   • Cars: 6 (linked to sellers)');
        console.log('   • Vouchers: 5');
        console.log('   • Orders: 6 (linked to buyers & cars)');
        console.log('   • Notifications: 8 (linked to users)');
        console.log('   • Search History: 15 (user searches)');
        console.log('   • Carts: 3 (linked to buyers)');
        console.log('   • Contacts: 4 (buyer-seller interactions)');
        console.log('   • Recommendations: 15 (personalized suggestions)');
        console.log('   • Social Shares: 18+ (platform tracking)');
        console.log('   • Contacts: 4 (buyer-seller interactions)');
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Seeding failed:', error.message);
        process.exit(1);
    }
};

// Run seeding
seedDatabase();
