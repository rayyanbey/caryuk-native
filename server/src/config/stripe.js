const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Initialize Stripe
 */
const initializeStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    }
    return stripe;
};

/**
 * Get Stripe public key
 */
const getPublicKey = () => {
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        throw new Error('STRIPE_PUBLISHABLE_KEY is not configured in environment variables');
    }
    return process.env.STRIPE_PUBLISHABLE_KEY;
};

/**
 * Stripe configuration options
 */
const stripeConfig = {
    apiVersion: '2024-04-10',
    maxNetworkRetries: 2,
    timeout: 20000
};

/**
 * Payment currency (PKR for Pakistan)
 */
const PAYMENT_CURRENCY = 'pkr';

/**
 * Refund reasons
 */
const REFUND_REASONS = {
    requested_by_customer: 'requested_by_customer',
    duplicate: 'duplicate',
    fraudulent: 'fraudulent',
    general: 'general'
};

/**
 * Payment status mapping
 */
const PAYMENT_STATUS = {
    SUCCEEDED: 'succeeded',
    PROCESSING: 'processing',
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
    REQUIRES_CONFIRMATION: 'requires_confirmation',
    REQUIRES_ACTION: 'requires_action',
    CANCELED: 'canceled'
};

module.exports = {
    stripe,
    initializeStripe,
    getPublicKey,
    stripeConfig,
    PAYMENT_CURRENCY,
    REFUND_REASONS,
    PAYMENT_STATUS
};