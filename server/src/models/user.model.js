const { Schema, model } = require('mongoose');
const hashPassword = require('../utils/authService.js').hashPassword;
const comparePassword = require('../utils/authService.js').comparePassword;
const generateToken = require('../utils/authService.js').generateToken;
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

UserSchema.methods.generateToken = function(){
    return generateToken(this);
}

UserSchema.methods.comparePassword = function(password){
    return comparePassword(password, this.password);
}

UserSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await hashPassword(this.password);
    }
    next();
})


module.exports = model('User', UserSchema);


