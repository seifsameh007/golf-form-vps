require('dotenv').config();
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// mock user middleware
app.use((req, res, next) => {
  req.user = { name: 'Admin', email: 'admin@admin.com', photo: '', role: 'admin' };
  next();
});

const dashboardRouter = require('./routes/dashboard');
// Override isAdmin
const auth = require('./middleware/auth');
auth.isAdmin = (req, res, next) => next();

app.use('/dashboard', dashboardRouter);

const request = require('supertest');
require('mongoose').connect(process.env.MONGO_URL).then(async () => {
  try {
    const res = await request(app).get('/dashboard/projects');
    console.log('Status code:', res.statusCode);
    if(res.statusCode !== 200) {
      console.log('Error output:', res.text.substring(0,500));
    } else {
      console.log('Page loaded successfully! Has <form id="projectForm">?', res.text.includes('id="projectForm"'));
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
});
