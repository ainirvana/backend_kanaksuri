// backend/models/ReportRecipient.js

const mongoose = require('mongoose');

const reportRecipientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  // Example: store array of formats they'd like to receive (CSV, PDF, etc.)
  formats: [{
    type: String,
    enum: ['csv', 'pdf', 'xlsx']
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportRecipient', reportRecipientSchema);
