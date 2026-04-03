// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin/login');
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  if (req.isAuthenticated()) {
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());
    console.log('isAdmin checking user:', req.user.email, 'role:', req.user.role);
    if (req.user.role === 'admin' || adminEmails.includes(req.user.email.toLowerCase())) {
      console.log('Access granted');
      return next();
    }
    console.log('Access denied for user:', req.user.email);
  } else {
    console.log('Not authenticated');
  }
  res.redirect('/admin/login');
};

module.exports = { isAuthenticated, isAdmin };
