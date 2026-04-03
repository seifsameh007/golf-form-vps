const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastOnline: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
