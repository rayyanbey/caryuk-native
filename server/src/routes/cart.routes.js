const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const verifyJWT = require('../middleware/verifyJWT');

/**
 * GET CART
 * GET /api/cart
 * Headers: Authorization: Bearer {token}
 */
router.get('/', verifyJWT, cartController.getCart);

/**
 * ADD TO CART
 * POST /api/cart
 * Headers: Authorization: Bearer {token}
 * Body: { carId, notes }
 */
router.post('/', verifyJWT, cartController.addToCart);

/**
 * GET CART SUMMARY
 * GET /api/cart/summary
 * Headers: Authorization: Bearer {token}
 */
router.get('/summary', verifyJWT, cartController.getCartSummary);

/**
 * APPLY VOUCHER TO CART
 * POST /api/cart/apply-voucher
 * Headers: Authorization: Bearer {token}
 * Body: { voucherCode }
 */
router.post('/apply-voucher', verifyJWT, cartController.applyVoucher);

/**
 * REMOVE FROM CART
 * DELETE /api/cart/:carId
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:carId', verifyJWT, cartController.removeFromCart);

/**
 * CLEAR CART
 * DELETE /api/cart
 * Headers: Authorization: Bearer {token}
 */
router.delete('/', verifyJWT, cartController.clearCart);

module.exports = router;
