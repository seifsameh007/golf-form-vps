const router = require('express').Router();
const { isAdmin } = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');
const Visit = require('../models/Visit');

// Dashboard middleware - update online status
router.use(async (req, res, next) => {
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: true,
        lastOnline: new Date()
      });
    } catch (e) {}
  }
  next();
});

// Dashboard overview
router.get('/', isAdmin, async (req, res) => {
  res.render('dashboard/overview', {
    title: 'لوحة التحكم - لمحة',
    page: 'overview',
    user: req.user
  });
});

// Requests page
router.get('/requests', isAdmin, (req, res) => {
  res.render('dashboard/requests', {
    title: 'لوحة التحكم - الطلبات',
    page: 'requests',
    user: req.user
  });
});

// Projects page
router.get('/projects', isAdmin, async (req, res) => {
  const Project = require('../models/Project');
  const projects = await Project.find().sort({ createdAt: -1 });
  res.render('dashboard/projects', {
    title: 'لوحة التحكم - المشروعات',
    page: 'projects',
    user: req.user,
    projects
  });
});

// Team page
router.get('/team', isAdmin, async (req, res) => {
  try {
    const team = await User.find().sort({ role: -1, name: 1 });
    res.render('dashboard/team', {
      title: 'لوحة التحكم - الإدارة',
      page: 'team',
      user: req.user,
      team
    });
  } catch (error) {
    res.render('dashboard/team', {
      title: 'لوحة التحكم - الإدارة',
      page: 'team',
      user: req.user,
      team: []
    });
  }
});

module.exports = router;
