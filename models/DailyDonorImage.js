// backend/models/DailyDonorImage.js

const mongoose = require('mongoose');

const dailyDonorImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DailyDonorImage', dailyDonorImageSchema);
