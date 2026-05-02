const { Schema, model } = require('mongoose');

const SocialShareSchema = new Schema({
    car: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
        index: true
    },
    platform: {
        type: String,
        enum: ['facebook', 'whatsapp', 'instagram', 'twitter', 'other'],
        required: true
    },
    sharedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    shareUrl: String,
    metadata: {
        userAgent: String,
        ipAddress: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient queries
SocialShareSchema.index({ car: 1, platform: 1 });
SocialShareSchema.index({ car: 1, timestamp: -1 });

module.exports = model('SocialShare', SocialShareSchema);
