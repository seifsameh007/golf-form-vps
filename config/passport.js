const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Update user info on each login
      user.name = profile.displayName || 'مستخدم بدون اسم';
      user.photo = profile.photos?.[0]?.value || '';
      user.isOnline = true;
      user.lastOnline = new Date();
      
      // Fix invalid roles that might have been manually set in DB
      if (!['admin', 'member'].includes(user.role)) {
        user.role = 'member';
      }
      
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName || 'مستخدم بدون اسم',
      email: profile.emails?.[0]?.value || `no-email-${profile.id}@example.com`,
      photo: profile.photos?.[0]?.value || '',
      role: 'member',
      isOnline: true,
      lastOnline: new Date()
    });

    // Check if this is the admin email
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());
    if (adminEmails.includes(user.email.toLowerCase())) {
      user.role = 'admin';
      await user.save();
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
