// backend/models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String },
  amount: { type: Number, required: true },
  note: { type: String },
  order_id: { type: String },
  payment_id: { type: String },
  razorpay_signature: { type: String },
  status: { type: String, default: 'created' },
  createdAt: { type: Date, default: Date.now },
  receiptNumber: { type: String },
  aadharCard: { type: String }, // new optional field
  panCard: { type: String },    // new optional field
  isDeleted: { type: Boolean, default: false } // Soft deletion flag for online donations
});

module.exports = mongoose.model('Donation', donationSchema);
