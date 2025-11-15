const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  item: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: { // <-- ADDED THIS LINE
      type: String,
      required: false 
    }
  },
  location: {
    type: String,
    required: true
  },
  contactInfo: {
    type: String,
    required: function() {
      return this.type === 'found';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'resolved', 'matched', 'approved', 'rejected'],
    default: 'active'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;