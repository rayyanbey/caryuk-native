const { Schema, model } = require('mongoose');

const CarSchema = new Schema({
  title:        { type: String, required: true },
  brand:        { type: String, required: true },
  model:        { type: String, required: true },
  year:         { type: Number, required: true },
  color:        { type: String },
  price:        { type: Number, required: true },
  category:     { type: String, enum: ['Sedan','SUV','Truck','Hatchback'] },
  fuelType:     { type: String, enum: ['Petrol','Diesel','Electric','Hybrid'] },
  transmission: { type: String, enum: ['Auto','Manual'] },
  mileage:      { type: Number },
  description:  { type: String },
  features:     [String],                       // ['AC','ABS','Sunroof']
  images:       [String],                       // Cloudinary URLs
  views:        { type: Number, default: 0 },
  seller:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { type: String, enum: ['available','sold','reserved'], default: 'available' },
  createdAt:    { type: Date, default: Date.now }
});

CarSchema.index({ title: 'text', brand: 'text', model: 'text' });

module.exports = model('Car', CarSchema);