const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String },               // null for OAuth users
  avatarUrl:    { type: String },
  phone:        { type: String },
  provider:     { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  providerId:   { type: String },               // Google/Facebook UID
  favourites:   [{ type: Schema.Types.ObjectId, ref: 'Car' }],
  expoPushToken:{ type: String },               // for push notifications
  createdAt:    { type: Date, default: Date.now }
});

module.exports = model('User', UserSchema);
