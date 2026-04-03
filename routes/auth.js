const router = require('express').Router();
const passport = require('passport');
const User = require('../models/User');

// Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/admin/login'
}), (req, res) => {
  res.redirect('/dashboard');
});

// Logout
router.get('/logout', async (req, res) => {
  try {
    // Set user offline
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: false,
        lastOnline: new Date()
      });
    }
    req.logout((err) => {
      if (err) console.error(err);
      res.redirect('/admin/login');
    });
  } catch (error) {
    req.logout(() => {});
    res.redirect('/admin/login');
  }
});

module.exports = router;
