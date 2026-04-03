const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  page: {
    type: String,
    default: '/'
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient daily queries
visitSchema.index({ date: 1, page: 1 }, { unique: true });

module.exports = mongoose.model('Visit', visitSchema);
