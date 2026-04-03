const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  rooms: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  hasWhatsApp: {
    type: Boolean,
    default: true
  },
  whatsappNumber: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  jobTitle: {
    type: String,
    trim: true,
    default: ''
  },
  preferredDay: {
    type: String,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['قيد المراجعة', 'اشتري', 'لم يشتري'],
    default: 'قيد المراجعة'
  },
  isTrash: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);
