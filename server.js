require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const connectDB = require('./config/db');
require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set('io', io);
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'golf-forms-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false
  }
});

// Session
app.use(sessionMiddleware);

// Socket.io Authentication Middleware using shared session
io.engine.use(sessionMiddleware);
io.use((socket, next) => {
  const token = socket.handshake.auth.token; // From the frontend
  const session = socket.request.session;
  
  // Validate either by token or by existing passport session
  if (token && session && session.passport && session.passport.user) {
    next();
  } else {
    next(new Error('unauthorized admin'));
  }
});

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Global middleware - pass user to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.authToken = req.session ? req.session.id : 'no-token';
  next();
});

// Visit tracking middleware
const Visit = require('./models/Visit');
app.use(async (req, res, next) => {
  // Only track page visits, not API calls or static assets
  if (!req.path.startsWith('/api') && !req.path.startsWith('/auth') && !req.path.includes('.')) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await Visit.findOneAndUpdate(
        { date: today, page: req.path },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Visit tracking error:', err.message);
    }
  }
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/dashboard', require('./routes/dashboard'));

// 404
app.use((req, res) => {
  res.status(404).render('home', { title: 'الصفحة غير موجودة' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ في السيرفر' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
