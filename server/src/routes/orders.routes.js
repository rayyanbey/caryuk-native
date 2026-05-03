const router = require('express').Router();
const ordersController = require('../controllers/orders.controller');
const verifyJWT = require('../middleware/verifyJWT');

// ============================================
// PROTECTED ROUTES (Require JWT)
// ============================================

/**
 * GET ALL ORDERS
 * GET /api/orders
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit, status }
 */
router.get('/', verifyJWT, ordersController.getAllOrders);

/**
 * GET ORDER BY ID
 * GET /api/orders/:id
 * Headers: Authorization: Bearer {token}
 */
router.get('/:id', verifyJWT, ordersController.getOrderById);

/**
 * CREATE ORDER
 * POST /api/orders
 * Headers: Authorization: Bearer {token}
 * Body: { carId, voucherCode }
 */
router.post('/', verifyJWT, ordersController.createOrder);

/**
 * UPDATE ORDER
 * PUT /api/orders/:id
 * Headers: Authorization: Bearer {token}
 * Body: { status }
 */
router.put('/:id', verifyJWT, ordersController.updateOrder);

/**
 * DELETE ORDER
 * DELETE /api/orders/:id
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:id', verifyJWT, ordersController.deleteOrder);

module.exports = router;