const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
require('dotenv').config();

// Local Strategy (Email/Password)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        if (!user.password) {
            return done(null, false, { message: 'Please sign in with OAuth provider' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ providerId: profile.id, provider: 'google' });
        
        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                provider: 'google',
                providerId: profile.id,
                avatarUrl: profile.photos?.[0]?.value
            });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialize/Deserialize
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;