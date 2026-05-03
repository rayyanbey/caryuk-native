const Voucher = require('../models/voucher.model');
require('dotenv').config();

/**
 * GET ALL VOUCHERS
 * GET /api/vouchers
 * Query: { page, limit, isActive }
 */
const getAllVouchers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const total = await Voucher.countDocuments(filter);
        const vouchers = await Voucher.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ expiresAt: 1 });

        res.status(200).json({
            success: true,
            data: vouchers,
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
 * VALIDATE VOUCHER
 * POST /api/vouchers/validate
 * Body: { code, orderAmount }
 */
const validateVoucher = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code || !orderAmount) {
            return res.status(400).json({
                success: false,
                error: 'Code and orderAmount are required'
            });
        }

        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

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

        if (orderAmount < voucher.minOrderAmount) {
            return res.status(400).json({
                success: false,
                error: `Minimum order amount for this voucher is ${voucher.minOrderAmount}`
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (voucher.discountType === 'percentage') {
            discountAmount = Math.round((orderAmount * voucher.discountValue) / 100);
            if (voucher.maxDiscountCap) {
                discountAmount = Math.min(discountAmount, voucher.maxDiscountCap);
            }
        } else if (voucher.discountType === 'flat') {
            discountAmount = voucher.discountValue;
        }

        const finalAmount = Math.max(0, orderAmount - discountAmount);

        res.status(200).json({
            success: true,
            valid: true,
            data: {
                code: voucher.code,
                discountType: voucher.discountType,
                discountValue: voucher.discountValue,
                originalAmount: orderAmount,
                discountAmount,
                finalAmount,
                message: `Voucher applied! You save ${discountAmount}`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CREATE VOUCHER (Admin only)
 * POST /api/vouchers
 * Headers: Authorization: Bearer {token}
 * Body: { code, discountType, discountValue, minOrderAmount, maxDiscountCap, expiresAt, usageLimit }
 */
const createVoucher = async (req, res, next) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxDiscountCap, expiresAt, usageLimit } = req.body;

        // Validation
        if (!code || !discountType || !discountValue || !expiresAt) {
            return res.status(400).json({
                success: false,
                error: 'Code, discountType, discountValue, and expiresAt are required'
            });
        }

        if (!['percentage', 'flat'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                error: 'discountType must be percentage or flat'
            });
        }

        // Check if code already exists
        const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
        if (existingVoucher) {
            return res.status(409).json({
                success: false,
                error: 'Voucher code already exists'
            });
        }

        const voucher = await Voucher.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscountCap,
            expiresAt: new Date(expiresAt),
            usageLimit: usageLimit || 1,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Voucher created successfully',
            data: voucher
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE VOUCHER (Admin only)
 * DELETE /api/vouchers/:id
 * Headers: Authorization: Bearer {token}
 */
const deleteVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;

        const voucher = await Voucher.findByIdAndDelete(id);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                error: 'Voucher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Voucher deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DEACTIVATE VOUCHER (Admin only)
 * PATCH /api/vouchers/:id/deactivate
 * Headers: Authorization: Bearer {token}
 */
const deactivateVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;

        const voucher = await Voucher.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!voucher) {
            return res.status(404).json({
                success: false,
                error: 'Voucher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Voucher deactivated successfully',
            data: voucher
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllVouchers,
    validateVoucher,
    createVoucher,
    deleteVoucher,
    deactivateVoucher
};