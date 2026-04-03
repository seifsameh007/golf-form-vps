const router = require('express').Router();
const passport = require('passport');

// Admin login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'تسجيل الدخول - الإدارة' });
});

// Redirect alias
router.get('/', (req, res) => res.redirect('/admin/login'));

module.exports = router;
