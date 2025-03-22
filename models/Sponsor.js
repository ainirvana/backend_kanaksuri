// backend/models/Sponsor.js

const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
