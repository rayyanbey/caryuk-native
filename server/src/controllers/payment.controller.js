const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order.model');
const Car = require('../models/car.model');
require('dotenv').config();

/**
 * CREATE PAYMENT INTENT
 * POST /api/payment/create-intent
 * Headers: Authorization: Bearer {token}
 * Body: { orderId }
 */
const createPaymentIntent = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID is required'
            });
        }

        const order = await Order.findById(orderId).populate('car');
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Order is not in pending status'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.amount * 100),
            currency: 'pkr',
            description: `Payment for ${order.car.title}`,
            metadata: {
                orderId: orderId,
                carId: order.car._id.toString()
            }
        });

        res.status(200).json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: order.amount,
                currency: 'pkr'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * HANDLE WEBHOOK
 * POST /api/payment/webhook
 */
const handleWebhook = async (req, res, next) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            return res.status(400).json({
                success: false,
                error: 'Webhook secret not configured'
            });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: `Webhook Error: ${err.message}`
            });
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            const order = await Order.findByIdAndUpdate(
                orderId,
                {
                    status: 'paid',
                    stripePaymentId: paymentIntent.id
                },
                { new: true }
            );

            if (order) {
                await Car.findByIdAndUpdate(order.car, { status: 'reserved' });
            }
        }

        if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            await Order.findByIdAndUpdate(
                orderId,
                { status: 'cancelled' },
                { new: true }
            );
        }

        res.json({ received: true });
    } catch (error) {
        next(error);
    }
};

/**
 * GET TRANSACTIONS
 * GET /api/payment/transactions
 * Headers: Authorization: Bearer {token}
 * Query: { page, limit, status }
 */
const getTransactions = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const filter = { buyer: userId };
        if (status) filter.status = status;

        const total = await Order.countDocuments(filter);
        const transactions = await Order.find(filter)
            .populate('car', 'title brand model price')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: transactions,
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
 * CONFIRM PAYMENT
 * POST /api/payment/confirm
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, paymentIntentId }
 */
const confirmPayment = async (req, res, next) => {
    try {
        const { orderId, paymentIntentId } = req.body;

        if (!orderId || !paymentIntentId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Payment Intent ID are required'
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                error: 'Payment not succeeded'
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'paid',
                stripePaymentId: paymentIntentId
            },
            { new: true }
        ).populate('car');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        await Car.findByIdAndUpdate(order.car._id, { status: 'reserved' });

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentIntent,
    handleWebhook,
    getTransactions,
    confirmPayment
};