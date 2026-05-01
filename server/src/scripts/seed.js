require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Import models
const User = require('../models/user.model');
const Car = require('../models/car.model');
const Order = require('../models/order.model');
const Voucher = require('../models/voucher.model');
const Notification = require('../models/notification.model');

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
 * Seed Notifications (linked to users)
 */
const seedNotifications = async (users) => {
    try {
        const notifications = [
            {
                userId: users[3]._id,
                title: 'Order Confirmed',
                body: 'Your order for Honda Civic has been confirmed and payment received.',
                type: 'order_update',
                read: false
            },
            {
                userId: users[3]._id,
                title: 'New Listing Alert',
                body: 'A new Toyota Fortuner matching your interests is now available.',
                type: 'new_listing',
                read: false
            },
            {
                userId: users[4]._id,
                title: 'Price Drop Alert',
                body: 'The Suzuki Alto you viewed is now 50,000 PKR cheaper!',
                type: 'price_drop',
                read: true
            },
            {
                userId: users[5]._id,
                title: 'Summer Special Promotion',
                body: 'Get 20% off on all SUVs this week with code SUMMER20.',
                type: 'promo',
                read: false
            },
            {
                userId: users[0]._id,
                title: 'New Order on Your Listing',
                body: 'Someone has placed an order for your Honda Civic. Check the details now.',
                type: 'order_update',
                read: true
            },
            {
                userId: users[1]._id,
                title: 'Payment Received',
                body: 'We have received payment for the sale of Suzuki Alto.',
                type: 'order_update',
                read: true
            },
            {
                userId: users[2]._id,
                title: 'System Maintenance',
                body: 'We are performing scheduled maintenance on May 3rd from 2 AM to 4 AM.',
                type: 'system',
                read: false
            },
            {
                userId: users[4]._id,
                title: 'Welcome to Caryuk',
                body: 'Welcome! Start exploring and listing your vehicles today.',
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
        
        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Seeded Data Summary:');
        console.log('   • Users: 6 (3 sellers, 3 buyers)');
        console.log('   • Cars: 6 (linked to sellers)');
        console.log('   • Vouchers: 5');
        console.log('   • Orders: 6 (linked to buyers & cars)');
        console.log('   • Notifications: 8 (linked to users)');
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Seeding failed:', error.message);
        process.exit(1);
    }
};

// Run seeding
seedDatabase();
