const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const verifyJWT = require('../middleware/verifyJWT');

// ============================================
// WEBHOOK ROUTE (No auth required)
// ============================================

/**
 * STRIPE WEBHOOK
 * POST /api/payment/webhook
 */
router.post('/webhook', paymentController.handleWebhook);

// ============================================
// PROTECTED ROUTES (Require JWT)
// ============================================

/**
 * CREATE PAYMENT INTENT
 * POST /api/payment/create-intent
 * Headers: Authorization: Bearer {token}
 * Body: { orderId }
 */
router.post('/create-intent', verifyJWT, paymentController.createPaymentIntent);

/**
 * CONFIRM PAYMENT
 * POST /api/payment/confirm
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, paymentIntentId }
 */
router.post('/confirm', verifyJWT, paymentController.confirmPayment);

/**
 * GET TRANSACTIONS
 * GET /api/payment/transactions
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit, status }
 */
router.get('/transactions', verifyJWT, paymentController.getTransactions);

module.exports = router;