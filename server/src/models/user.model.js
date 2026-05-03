const { Schema, model } = require('mongoose');
const { hashPassword, comparePassword, generateToken } = require('../utils/authService');

const UserSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String },               // null for OAuth users
  avatarUrl:    { type: String },
  phone:        { type: String },
  address:      { type: String },
  provider:     { type: String, enum: ['local', 'google'], default: 'local' },
  providerId:   { type: String },               // OAuth provider UID
  favourites:   [{ type: Schema.Types.ObjectId, ref: 'Car' }],
  expoPushToken:{ type: String },               // for push notifications
  isActive:     { type: Boolean, default: true },
  lastLogin:    { type: Date },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now }
});

// Instance methods
UserSchema.methods.generateToken = function() {
    return generateToken(this);
};

UserSchema.methods.comparePassword = function(password) {
    return comparePassword(password, this.password);
};

// Pre-save hook to hash password
UserSchema.pre('save', async function() {
    if (this.isModified('password') && this.password) {
        try {
            this.password = await hashPassword(this.password);
        } catch (error) {
            next(error);
        }
    }
    this.updatedAt = new Date();
});

module.exports = model('User', UserSchema);


