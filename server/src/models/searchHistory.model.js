const { Schema, model } = require('mongoose');

const SearchHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    query: {
        type: String,
        trim: true
    },
    filters: {
        category: String,
        minPrice: Number,
        maxPrice: Number,
        fuelType: String,
        transmission: String
    },
    resultCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient queries
SearchHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = model('SearchHistory', SearchHistorySchema);
