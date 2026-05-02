const { Schema, model } = require('mongoose');

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    items: [
        {
            car: {
                type: Schema.Types.ObjectId,
                ref: 'Car',
                required: true
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            notes: String
        }
    ],
    appliedVoucher: String,
    discountAmount: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

CartSchema.pre('save', function() {
    this.updatedAt = new Date();
});

module.exports = model('Cart', CartSchema);
