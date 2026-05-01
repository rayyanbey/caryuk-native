const { Schema, model } = require('mongoose');

const VoucherSchema = new Schema({
    code: {
      type:      String,
      required:  true,
      unique:    true,
      uppercase: true,                      // SAVE10, FLAT500 etc.
      trim:      true
    },
    discountType: {
      type:     String,
      enum:     ['percentage', 'flat'],
      required: true
      // percentage = 20% off, flat = PKR 500 off
    },
    discountValue: {
      type:     Number,
      required: true,
      min:      0
      // if percentage: 0–100, if flat: any positive number
    },
    minOrderAmount: {
      type:    Number,
      default: 0                            // minimum cart value to apply voucher
    },
    maxDiscountCap: {
      type:    Number,
      default: null                         // max discount even if % is higher
      // e.g. 30% off but capped at PKR 2000
    },
    expiresAt: {
      type:     Date,
      required: true
    },
    isActive: {
      type:    Boolean,
      default: true
    },
    usageLimit: {
      type:    Number,
      default: 1                            // how many total users can use it
    },
    usedCount: {
      type:    Number,
      default: 0                            // increments on every successful use
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref:  'User'                        // prevents same user using twice
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = model('Voucher', VoucherSchema);