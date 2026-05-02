const { Schema, model } = require('mongoose');

const RecommendationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    recommendedCar: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    reason: {
        type: String,
        enum: [
            'similar_category',
            'same_brand',
            'similar_price',
            'trending',
            'favorite_match',
            'popular'
        ],
        required: true
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    generatedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient queries
RecommendationSchema.index({ userId: 1, generatedAt: -1 });
RecommendationSchema.index({ userId: 1, recommendedCar: 1 });

module.exports = model('Recommendation', RecommendationSchema);
