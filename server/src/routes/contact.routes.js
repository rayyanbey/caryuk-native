const router = require('express').Router();
const contactController = require('../controllers/contact.controller');
const verifyJWT = require('../middleware/verifyJWT');

/**
 * INITIATE PHONE CALL
 * POST /api/contact/phone/:carId
 * Headers: Authorization: Bearer {token}
 */
router.post('/phone/:carId', verifyJWT, contactController.initiatePhoneCall);

/**
 * INITIATE SMS
 * POST /api/contact/sms/:carId
 * Headers: Authorization: Bearer {token}
 * Body: { message }
 */
router.post('/sms/:carId', verifyJWT, contactController.initiateSMS);

/**
 * GET CONTACT HISTORY (sent by user)
 * GET /api/contact/history
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit }
 */
router.get('/history', verifyJWT, contactController.getContactHistory);

/**
 * GET RECEIVED CONTACTS (for sellers)
 * GET /api/contact/received
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit }
 */
router.get('/received', verifyJWT, contactController.getReceivedContacts);

/**
 * REPORT CONTACT
 * POST /api/contact/:contactId/report
 * Headers: Authorization: Bearer {token}
 * Body: { reason }
 */
router.post('/:contactId/report', verifyJWT, contactController.reportContact);

module.exports = router;
