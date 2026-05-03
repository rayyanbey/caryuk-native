const {
    stripe,
    PAYMENT_CURRENCY,
    REFUND_REASONS,
    PAYMENT_STATUS,
    getPublicKey
} = require('../config/stripe');
const Order = require('../models/order.model');
const Car = require('../models/car.model');
const User = require('../models/user.model');
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

        const orderAmount = Number(order.amount); // Stored in PKR major units.
        const stripeCurrency = PAYMENT_CURRENCY || 'usd';
        const pkrPerUsd = Number(process.env.PKR_PER_USD || 280);
        const stripeMaxAmount = Number(process.env.STRIPE_MAX_AMOUNT || 99999999);

        let stripeAmount;
        let amountMultiplierUsed;

        if (stripeCurrency === 'usd') {
            if (!Number.isFinite(pkrPerUsd) || pkrPerUsd <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid PKR_PER_USD conversion rate configuration'
                });
            }

            const usdAmount = orderAmount / pkrPerUsd;
            stripeAmount = Math.round(usdAmount * 100); // USD cents
            amountMultiplierUsed = Number((100 / pkrPerUsd).toFixed(6));
        } else if (stripeCurrency === 'pkr') {
            stripeAmount = Math.round(orderAmount * 100); // PKR paisa
            amountMultiplierUsed = 100;
        } else {
            return res.status(400).json({
                success: false,
                error: `Unsupported Stripe currency: ${stripeCurrency}`
            });
        }

        if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid order amount for Stripe payment'
            });
        }

        if (!Number.isFinite(stripeAmount) || stripeAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid computed Stripe amount'
            });
        }

        if (stripeAmount > stripeMaxAmount) {
            return res.status(400).json({
                success: false,
                error: `Amount cannot be greater than ${stripeMaxAmount} in Stripe minor units for ${stripeCurrency.toUpperCase()}`,
                details: {
                    orderAmount,
                    stripeAmount,
                    maxAllowed: stripeMaxAmount,
                    stripeCurrency,
                    amountMultiplierUsed,
                    pkrPerUsd: stripeCurrency === 'usd' ? pkrPerUsd : undefined
                }
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeAmount,
            currency: stripeCurrency,
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
                amount: orderAmount,
                currency: stripeCurrency,
                amountMultiplierUsed
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

/**
 * REFUND PAYMENT
 * POST /api/payment/refund
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, reason, amount }
 */
const refundPayment = async (req, res, next) => {
    try {
        const { orderId, reason = 'requested_by_customer', amount } = req.body;

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

        if (order.status !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Only paid orders can be refunded'
            });
        }

        if (!order.stripePaymentId) {
            return res.status(400).json({
                success: false,
                error: 'No Stripe payment ID found for this order'
            });
        }

        try {
            const refund = await stripe.refunds.create({
                payment_intent: order.stripePaymentId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason: reason,
                metadata: {
                    orderId: orderId
                }
            });

            await Order.findByIdAndUpdate(
                orderId,
                {
                    status: 'cancelled',
                    refundId: refund.id
                }
            );

            // Revert car status back to available
            await Car.findByIdAndUpdate(order.car._id, { status: 'available' });

            res.status(200).json({
                success: true,
                message: 'Refund processed successfully',
                data: {
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                    reason: refund.reason
                }
            });
        } catch (stripeError) {
            return res.status(400).json({
                success: false,
                error: `Stripe refund error: ${stripeError.message}`
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * GET PAYMENT STATUS
 * GET /api/payment/status/:paymentIntentId
 * Headers: Authorization: Bearer {token} (optional)
 */
const getPaymentStatus = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.params;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                error: 'Payment Intent ID is required'
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                description: paymentIntent.description,
                clientSecret: paymentIntent.client_secret,
                lastPaymentError: paymentIntent.last_payment_error,
                charges: paymentIntent.charges
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * CANCEL PAYMENT
 * POST /api/payment/cancel
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, cancellationReason }
 */
const cancelPayment = async (req, res, next) => {
    try {
        const { orderId, cancellationReason = 'No reason provided' } = req.body;

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

        if (order.status === 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel paid orders. Please use refund instead.'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Order is already cancelled'
            });
        }

        // Cancel payment intent if exists
        if (order.stripePaymentId) {
            try {
                await stripe.paymentIntents.cancel(order.stripePaymentId);
            } catch (stripeError) {
                console.log('Stripe cancel error (non-critical):', stripeError.message);
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'cancelled',
                cancellationReason
            },
            { new: true }
        ).populate('car');

        res.status(200).json({
            success: true,
            message: 'Payment cancelled successfully',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET TRANSACTION DETAILS
 * GET /api/payment/transaction/:orderId
 * Headers: Authorization: Bearer {token}
 */
const getTransactionDetails = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID is required'
            });
        }

        const order = await Order.findById(orderId)
            .populate('buyer', 'name email phone')
            .populate('car', 'title brand model price images')
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        let stripeDetails = null;
        if (order.stripePaymentId) {
            try {
                stripeDetails = await stripe.paymentIntents.retrieve(order.stripePaymentId);
            } catch (stripeError) {
                console.log('Error fetching Stripe details:', stripeError.message);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                order: {
                    id: order._id,
                    status: order.status,
                    amount: order.amount,
                    discountAmount: order.discountAmount,
                    voucherCode: order.voucherCode,
                    buyer: order.buyer,
                    car: order.car,
                    createdAt: order.createdAt
                },
                stripe: stripeDetails ? {
                    paymentIntentId: stripeDetails.id,
                    status: stripeDetails.status,
                    amount: stripeDetails.amount / 100,
                    currency: stripeDetails.currency,
                    charges: stripeDetails.charges.data.map(charge => ({
                        id: charge.id,
                        amount: charge.amount / 100,
                        status: charge.status,
                        paymentMethod: charge.payment_method_details
                    }))
                } : null
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * INITIALIZE CHECKOUT
 * POST /api/payment/initialize-checkout
 * Headers: Authorization: Bearer {token}
 * Body: { orderId, returnUrl }
 */
const initializeCheckout = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { orderId, returnUrl } = req.body;

        if (!orderId || !returnUrl) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and return URL are required'
            });
        }

        const order = await Order.findById(orderId)
            .populate('buyer', 'email')
            .populate('car', 'title images');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.buyer._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized: This order does not belong to you'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Order is not in pending status'
            });
        }

        try {
            const orderAmount = Number(order.amount); // PKR major
            const stripeCurrency = PAYMENT_CURRENCY || 'usd';
            const pkrPerUsd = Number(process.env.PKR_PER_USD || 280);

            let unitAmount;
            if (stripeCurrency === 'usd') {
                if (!Number.isFinite(pkrPerUsd) || pkrPerUsd <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid PKR_PER_USD conversion rate configuration'
                    });
                }
                unitAmount = Math.round((orderAmount / pkrPerUsd) * 100);
            } else if (stripeCurrency === 'pkr') {
                unitAmount = Math.round(orderAmount * 100);
            } else {
                return res.status(400).json({
                    success: false,
                    error: `Unsupported Stripe currency: ${stripeCurrency}`
                });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: stripeCurrency,
                            product_data: {
                                name: order.car.title,
                                description: `Car purchase - Order ${orderId}`
                            },
                            unit_amount: unitAmount
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
                cancel_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=cancelled`,
                customer_email: order.buyer.email,
                metadata: {
                    orderId: orderId,
                    userId: userId
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    sessionId: session.id,
                    sessionUrl: session.url,
                    publishableKey: getPublicKey()
                }
            });
        } catch (stripeError) {
            return res.status(400).json({
                success: false,
                error: `Stripe error: ${stripeError.message}`
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * GET PUBLIC STRIPE KEY
 * GET /api/payment/public-key
 */
const getPublicStripeKey = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                publicKey: getPublicKey()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createPaymentIntent,
    handleWebhook,
    getTransactions,
    confirmPayment,
    refundPayment,
    getPaymentStatus,
    cancelPayment,
    getTransactionDetails,
    initializeCheckout,
    getPublicStripeKey
};