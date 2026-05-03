const Contact = require('../models/contact.model');
const User = require('../models/user.model');
const Car = require('../models/car.model');

/**
 * INITIATE PHONE CALL
 * POST /api/contact/phone/:carId
 * Headers: Authorization: Bearer {token}
 */
const initiatePhoneCall = async (req, res, next) => {
    try {
        const initiatorId = req.userId;
        const { carId } = req.params;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        const recipient = await User.findById(car.seller).select('phone');
        if (!recipient || !recipient.phone) {
            return res.status(400).json({
                success: false,
                error: 'Seller phone number not available'
            });
        }

        const contact = new Contact({
            initiator: initiatorId,
            recipient: car.seller,
            car: carId,
            contactMethod: 'phone',
            recipientPhone: recipient.phone
        });

        await contact.save();

        res.status(201).json({
            success: true,
            message: 'Phone call initiated',
            data: {
                contactId: contact._id,
                sellerPhone: recipient.phone,
                method: 'phone',
                instruction: 'Call the seller at this number'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * INITIATE SMS
 * POST /api/contact/sms/:carId
 * Headers: Authorization: Bearer {token}
 * Body: { message }
 */
const initiateSMS = async (req, res, next) => {
    try {
        const initiatorId = req.userId;
        const { carId } = req.params;
        const { message } = req.body;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        const recipient = await User.findById(car.seller).select('phone');
        if (!recipient || !recipient.phone) {
            return res.status(400).json({
                success: false,
                error: 'Seller phone number not available'
            });
        }

        const contact = new Contact({
            initiator: initiatorId,
            recipient: car.seller,
            car: carId,
            contactMethod: 'sms',
            recipientPhone: recipient.phone,
            message: message || `Hi, I'm interested in your ${car.title}. Can we discuss?`
        });

        await contact.save();

        res.status(201).json({
            success: true,
            message: 'SMS initiated',
            data: {
                contactId: contact._id,
                sellerPhone: recipient.phone,
                method: 'sms',
                message: contact.message,
                instruction: 'Send SMS to this number with the message'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET CONTACT HISTORY
 * GET /api/contact/history
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit }
 */
const getContactHistory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const total = await Contact.countDocuments({ initiator: userId });
        const contacts = await Contact.find({ initiator: userId })
            .populate('car', 'title brand model year images')
            .populate('recipient', 'name phone')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: contacts,
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
 * REPORT CONTACT
 * POST /api/contact/:contactId/report
 * Headers: Authorization: Bearer {token}
 * Body: { reason }
 */
const reportContact = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const { reason } = req.body;

        const contact = await Contact.findByIdAndUpdate(
            contactId,
            { status: 'reported' },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact reported. Our team will review this.',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET RECEIVED CONTACTS (for sellers)
 * GET /api/contact/received
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit }
 */
const getReceivedContacts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const total = await Contact.countDocuments({ recipient: userId });
        const contacts = await Contact.find({ recipient: userId })
            .populate('car', 'title brand model year images price')
            .populate('initiator', 'name phone email')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: contacts,
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

module.exports = {
    initiatePhoneCall,
    initiateSMS,
    getContactHistory,
    reportContact,
    getReceivedContacts
};
