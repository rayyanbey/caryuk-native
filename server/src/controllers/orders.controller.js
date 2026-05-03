const Order = require('../models/order.model');
const Car = require('../models/car.model');
const Voucher = require('../models/voucher.model');
const User = require('../models/user.model');
require('dotenv').config();

/**
 * GET ALL ORDERS
 * GET /api/orders
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit, status }
 */
const getAllOrders = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const filter = { buyer: userId };
        if (status) filter.status = status;

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('buyer', 'name email phone')
            .populate('car', 'title brand model price images')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET ORDER BY ID
 * GET /api/orders/:id
 * Headers: Authorization: Bearer {token}
 */
const getOrderById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('buyer', 'name email phone')
            .populate('car', 'title brand model price images seller')
            .populate('car.seller', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.buyer.toString() !== userId && order.car.seller.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CREATE ORDER
 * POST /api/orders
 * Headers: Authorization: Bearer {token}
 * Body: { carId, voucherCode }
 */
const createOrder = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { carId, voucherCode } = req.body;

        if (!carId) {
            return res.status(400).json({
                success: false,
                error: 'Car ID is required'
            });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        if (car.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: 'Car is not available'
            });
        }

        if (car.seller.toString() === userId) {
            return res.status(400).json({
                success: false,
                error: 'You cannot order your own car'
            });
        }

        let amount = car.price;
        let discountAmount = 0;
        let appliedVoucher = null;

        if (voucherCode) {
            const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
            
            if (!voucher) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid voucher code'
                });
            }

            if (!voucher.isActive) {
                return res.status(400).json({
                    success: false,
                    error: 'Voucher is not active'
                });
            }

            if (new Date() > voucher.expiresAt) {
                return res.status(400).json({
                    success: false,
                    error: 'Voucher has expired'
                });
            }

            if (voucher.usedCount >= voucher.usageLimit) {
                return res.status(400).json({
                    success: false,
                    error: 'Voucher usage limit reached'
                });
            }

            if (amount < voucher.minOrderAmount) {
                return res.status(400).json({
                    success: false,
                    error: `Minimum order amount for this voucher is ${voucher.minOrderAmount}`
                });
            }

            if (voucher.discountType === 'percentage') {
                discountAmount = Math.round((amount * voucher.discountValue) / 100);
                if (voucher.maxDiscountCap) {
                    discountAmount = Math.min(discountAmount, voucher.maxDiscountCap);
                }
            } else if (voucher.discountType === 'flat') {
                discountAmount = voucher.discountValue;
            }

            appliedVoucher = voucherCode.toUpperCase();
        }

        const finalAmount = Math.max(0, amount - discountAmount);

        const order = await Order.create({
            buyer: userId,
            car: carId,
            amount: finalAmount,
            discountAmount,
            voucherCode: appliedVoucher,
            status: 'pending'
        });

        if (appliedVoucher) {
            await Voucher.findOneAndUpdate(
                { code: appliedVoucher },
                {
                    $inc: { usedCount: 1 },
                    $push: { usedBy: userId }
                }
            );
        }

        await order.populate('buyer', 'name email phone');
        await order.populate('car', 'title brand model price images');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE ORDER STATUS
 * PUT /api/orders/:id
 * Headers: Authorization: Bearer {token}
 * Body: { status }
 */
const updateOrder = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.buyer.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this order'
            });
        }

        order.status = status;
        await order.save();
        await order.populate('buyer', 'name email phone');
        await order.populate('car', 'title brand model price images');

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE ORDER
 * DELETE /api/orders/:id
 * Headers: Authorization: Bearer {token}
 */
const deleteOrder = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.buyer.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this order'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Can only delete pending orders'
            });
        }

        await Order.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};