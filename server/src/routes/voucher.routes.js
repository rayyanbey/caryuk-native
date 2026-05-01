const router = require('express').Router();
const voucherController = require('../controllers/voucher.controller');
const verifyJWT = require('../middleware/verifyJWT');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET ALL VOUCHERS
 * GET /api/vouchers
 * Query: { page, limit, isActive }
 */
router.get('/', voucherController.getAllVouchers);

/**
 * VALIDATE VOUCHER
 * POST /api/vouchers/validate
 * Body: { code, orderAmount }
 */
router.post('/validate', voucherController.validateVoucher);

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================

/**
 * CREATE VOUCHER
 * POST /api/vouchers
 * Headers: Authorization: Bearer {token}
 * Body: { code, discountType, discountValue, minOrderAmount, maxDiscountCap, expiresAt, usageLimit }
 */
router.post('/', verifyJWT, voucherController.createVoucher);

/**
 * DEACTIVATE VOUCHER
 * PATCH /api/vouchers/:id/deactivate
 * Headers: Authorization: Bearer {token}
 */
router.patch('/:id/deactivate', verifyJWT, voucherController.deactivateVoucher);

/**
 * DELETE VOUCHER
 * DELETE /api/vouchers/:id
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:id', verifyJWT, voucherController.deleteVoucher);

module.exports = router;