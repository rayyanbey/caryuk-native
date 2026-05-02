/**
 * Stripe Payment Testing Utility
 * Use this for local testing without real payments
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Test Stripe Connection
 */
const testStripeConnection = async () => {
    try {
        const account = await stripe.account.retrieve();
        console.log('✓ Stripe connected successfully');
        console.log(`  Account: ${account.email}`);
        console.log(`  Country: ${account.country}`);
        return true;
    } catch (error) {
        console.error('✗ Stripe connection failed:', error.message);
        return false;
    }
};

/**
 * Test Payment Intent Creation
 */
const testPaymentIntent = async () => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 250000, // 2,500 PKR
            currency: 'pkr',
            description: 'Test payment',
            metadata: { test: true }
        });
        
        console.log('✓ Payment intent created');
        console.log(`  ID: ${paymentIntent.id}`);
        console.log(`  Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
        console.log(`  Status: ${paymentIntent.status}`);
        return paymentIntent;
    } catch (error) {
        console.error('✗ Payment intent creation failed:', error.message);
        return null;
    }
};

/**
 * Test Webhook Signature Verification
 */
const testWebhookSignature = async (payload, signature) => {
    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        console.log('✓ Webhook signature verified');
        console.log(`  Event type: ${event.type}`);
        console.log(`  Event ID: ${event.id}`);
        return event;
    } catch (error) {
        console.error('✗ Webhook signature verification failed:', error.message);
        return null;
    }
};

/**
 * List Test Charges
 */
const listTestCharges = async (limit = 5) => {
    try {
        const charges = await stripe.charges.list({ limit });
        
        console.log(`✓ Retrieved ${charges.data.length} charges`);
        charges.data.forEach((charge, i) => {
            console.log(`  ${i + 1}. ${charge.id} - ${charge.amount / 100} ${charge.currency} (${charge.status})`);
        });
        return charges.data;
    } catch (error) {
        console.error('✗ Failed to list charges:', error.message);
        return [];
    }
};

/**
 * Run All Tests
 */
const runAllTests = async () => {
    console.log('\n🧪 Stripe Payment System Tests\n');
    console.log('========================================\n');
    
    const connection = await testStripeConnection();
    console.log('');
    
    if (connection) {
        await testPaymentIntent();
        console.log('');
        
        await listTestCharges();
        console.log('');
        
        console.log('✅ All tests completed!\n');
        console.log('Next steps:');
        console.log('1. Update .env with real Stripe keys');
        console.log('2. Test payment creation endpoint');
        console.log('3. Configure webhook in Stripe dashboard');
        console.log('4. Test webhook delivery\n');
    } else {
        console.log('\n⚠️  Cannot proceed with tests - Stripe connection failed');
        console.log('Make sure STRIPE_SECRET_KEY is set in .env\n');
    }
};

// Export for use in other files
module.exports = {
    testStripeConnection,
    testPaymentIntent,
    testWebhookSignature,
    listTestCharges,
    runAllTests
};

// Run tests if executed directly
if (require.main === module) {
    require('dotenv').config();
    runAllTests().catch(console.error);
}
