const router = require('express').Router();

const Project = require('../models/Project');

// Home page
router.get('/', (req, res) => {
  res.redirect('/form/q-bay');
});

// Form page - dynamic project name
router.get('/form/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      const allProjects = await Project.find().sort({ name: 1 });
      return res.status(404).render('form-not-found', { 
        title: 'عذراً - المشروع غير موجود', 
        projects: allProjects 
      });
    }
    res.render('form', { title: project.name + ' - طلب جديد', project });
  } catch (error) {
    res.status(500).send('حدث خطأ');
  }
});

// Admin login page
router.get('/admin/login', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  if (req.isAuthenticated()) {
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());
    console.log('Login route check: user', req.user.email, 'role:', req.user.role);
    if (req.user.role === 'admin' || adminEmails.includes(req.user.email?.toLowerCase())) {
      console.log('Redirecting existing admin to dashboard');
      return res.redirect('/dashboard');
    } else {
      console.log('Logging out non-admin user');
      return req.logout(() => {
        res.render('auth/login', { title: 'تسجيل الدخول - الإدارة', error: 'عذراً، هذا الحساب لا يملك صلاحية الدخول كمسؤول.' });
      });
    }
  }
  
  const errorMessage = req.query.error === 'unauthorized' ? 'عذراً لا تملك صلاحية الدخول كمسؤول' : null;
  res.render('auth/login', { title: 'تسجيل الدخول - الإدارة', error: errorMessage });
});

module.exports = router;
