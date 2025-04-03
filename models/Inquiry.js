// backend/models/Inquiry.js
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String }, // Optional, provided by the Contact form
  comments: { type: String, required: true },
  source: { type: String, required: true }, // e.g., "about", "contact"
  status: { type: String, default: 'new' }, // e.g., new, in-progress, closed
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tracks which admin is handling it
  adminRemarks: [{
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remark: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inquiry', inquirySchema);
