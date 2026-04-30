const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20")
const User = require("../models/user.model")


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (_, __, profile, done) => {
  let user = await User.findOne({ providerId: profile.id });
  if (!user) {
    user = await User.create({
      name: profile.displayName,
      email: profile.emails?.[0].value,
      provider: 'google',
      providerId: profile.id,
      avatarUrl: profile.photos?.[0].value
    });
  }
  done(null, user);
}));