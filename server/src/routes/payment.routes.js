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
// PUBLIC ROUTES (No auth required)
// ============================================

/**
 * GET PUBLIC STRIPE KEY
 * GET /api/payment/public-key
 */
router.get('/public-key', paymentController.getPublicStripeKey);

/**
 * GET PAYMENT STATUS
 * GET /api/payment/status/:paymentIntentId
 */
router.get('/status/:paymentIntentId', paymentController.getPaymentStatus);

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
 * REFUND PAYMENT
 * POST /api/payment/refund
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, reason, amount }
 */
router.post('/refund', verifyJWT, paymentController.refundPayment);

/**
 * CANCEL PAYMENT
 * POST /api/payment/cancel
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, cancellationReason }
 */
router.post('/cancel', verifyJWT, paymentController.cancelPayment);

/**
 * INITIALIZE CHECKOUT SESSION
 * POST /api/payment/initialize-checkout
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, returnUrl }
 */
router.post('/initialize-checkout', verifyJWT, paymentController.initializeCheckout);

/**
 * GET TRANSACTION DETAILS
 * GET /api/payment/transaction/:orderId
 * Headers: Authorization: Bearer {token}
 */
router.get('/transaction/:orderId', verifyJWT, paymentController.getTransactionDetails);

/**
 * GET TRANSACTIONS
 * GET /api/payment/transactions
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit, status }
 */
router.get('/transactions', verifyJWT, paymentController.getTransactions);

module.exports = router;