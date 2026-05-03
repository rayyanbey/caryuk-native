const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    initiator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    car: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
        index: true
    },
    contactMethod: {
        type: String,
        enum: ['phone', 'sms'],
        required: true
    },
    recipientPhone: {
        type: String,
        required: true
    },
    message: String,
    status: {
        type: String,
        enum: ['initiated', 'completed', 'reported'],
        default: 'initiated'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient queries
ContactSchema.index({ initiator: 1, timestamp: -1 });
ContactSchema.index({ recipient: 1, timestamp: -1 });

module.exports = model('Contact', ContactSchema);
