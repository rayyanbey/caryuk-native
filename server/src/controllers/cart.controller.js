const Cart = require('../models/cart.model');
const Car = require('../models/car.model');
const Voucher = require('../models/voucher.model');

/**
 * GET CART
 * GET /api/cart
 * Headers: Authorization: Bearer {token}
 */
const getCart = async (req, res, next) => {
    try {
        const userId = req.userId;

        let cart = await Cart.findOne({ userId }).populate({
            path: 'items.car',
            select: 'title brand model price color year images seller'
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    userId,
                    items: [],
                    appliedVoucher: null,
                    discountAmount: 0,
                    totalAmount: 0,
                    finalAmount: 0
                }
            });
        }

        // Calculate totals
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.car?.price || 0), 0);
        const finalAmount = totalAmount - cart.discountAmount;

        res.status(200).json({
            success: true,
            data: {
                ...cart.toObject(),
                totalAmount,
                finalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ADD TO CART
 * POST /api/cart
 * Headers: Authorization: Bearer {token}
 * Body: { carId, notes }
 */
const addToCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { carId, notes } = req.body;

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

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if car already in cart
        const itemExists = cart.items.find(item => item.car.toString() === carId);
        if (itemExists) {
            return res.status(400).json({
                success: false,
                error: 'Car already in cart'
            });
        }

        cart.items.push({
            car: carId,
            notes: notes || ''
        });

        await cart.save();
        await cart.populate({
            path: 'items.car',
            select: 'title brand model price color year images'
        });

        const totalAmount = cart.items.reduce((sum, item) => sum + (item.car?.price || 0), 0);
        const finalAmount = totalAmount - cart.discountAmount;

        res.status(201).json({
            success: true,
            message: 'Car added to cart',
            data: {
                ...cart.toObject(),
                totalAmount,
                finalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * REMOVE FROM CART
 * DELETE /api/cart/:carId
 * Headers: Authorization: Bearer {token}
 */
const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { carId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item.car.toString() !== carId);
        await cart.save();
        await cart.populate({
            path: 'items.car',
            select: 'title brand model price color year images'
        });

        const totalAmount = cart.items.reduce((sum, item) => sum + (item.car?.price || 0), 0);
        const finalAmount = totalAmount - cart.discountAmount;

        res.status(200).json({
            success: true,
            message: 'Car removed from cart',
            data: {
                ...cart.toObject(),
                totalAmount,
                finalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * APPLY VOUCHER TO CART
 * POST /api/cart/apply-voucher
 * Headers: Authorization: Bearer {token}
 * Body: { voucherCode }
 */
const applyVoucher = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { voucherCode } = req.body;

        if (!voucherCode) {
            return res.status(400).json({
                success: false,
                error: 'Voucher code is required'
            });
        }

        let cart = await Cart.findOne({ userId }).populate({
            path: 'items.car',
            select: 'price'
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }

        const totalAmount = cart.items.reduce((sum, item) => sum + (item.car?.price || 0), 0);

        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });

        if (!voucher) {
            return res.status(404).json({
                success: false,
                error: 'Voucher not found'
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

        if (totalAmount < voucher.minOrderAmount) {
            return res.status(400).json({
                success: false,
                error: `Minimum order amount is ${voucher.minOrderAmount}`
            });
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({
                success: false,
                error: 'Voucher usage limit reached'
            });
        }

        let discountAmount = 0;
        if (voucher.discountType === 'percentage') {
            discountAmount = (totalAmount * voucher.discountValue) / 100;
            if (voucher.maxDiscountCap) {
                discountAmount = Math.min(discountAmount, voucher.maxDiscountCap);
            }
        } else {
            discountAmount = voucher.discountValue;
        }

        cart.appliedVoucher = voucherCode.toUpperCase();
        cart.discountAmount = discountAmount;
        await cart.save();

        const finalAmount = totalAmount - discountAmount;

        res.status(200).json({
            success: true,
            message: 'Voucher applied successfully',
            data: {
                ...cart.toObject(),
                totalAmount,
                discountAmount,
                finalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET CART SUMMARY
 * GET /api/cart/summary
 * Headers: Authorization: Bearer {token}
 */
const getCartSummary = async (req, res, next) => {
    try {
        const userId = req.userId;

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.car',
            select: 'price title'
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    itemCount: 0,
                    totalAmount: 0,
                    discountAmount: 0,
                    finalAmount: 0,
                    appliedVoucher: null
                }
            });
        }

        const totalAmount = cart.items.reduce((sum, item) => sum + (item.car?.price || 0), 0);
        const finalAmount = totalAmount - cart.discountAmount;

        res.status(200).json({
            success: true,
            data: {
                itemCount: cart.items.length,
                items: cart.items.map(item => ({
                    carId: item.car._id,
                    carTitle: item.car.title,
                    price: item.car.price
                })),
                totalAmount,
                discountAmount: cart.discountAmount,
                finalAmount,
                appliedVoucher: cart.appliedVoucher
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CLEAR CART
 * DELETE /api/cart
 * Headers: Authorization: Bearer {token}
 */
const clearCart = async (req, res, next) => {
    try {
        const userId = req.userId;

        await Cart.findOneAndUpdate(
            { userId },
            { items: [], appliedVoucher: null, discountAmount: 0 },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    applyVoucher,
    getCartSummary,
    clearCart
};
