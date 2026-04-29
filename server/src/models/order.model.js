import { Schema, model } from 'mongoose';

const OrderSchema = new Schema({
  buyer:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  car:            { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  amount:         { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  voucherCode:    { type: String },
  stripePaymentId:{ type: String },
  status:         { type: String, enum: ['pending','paid','cancelled'], default: 'pending' },
  createdAt:      { type: Date, default: Date.now }
});

module.exports = model('Order', OrderSchema);