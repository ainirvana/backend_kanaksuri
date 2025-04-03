// // backend/models/CashDonation.js
const mongoose = require('mongoose');
const Counter = require('./Counter');

const cashDonationSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  city: { type: String }, // <-- NEW FIELD ADDED
  amount: { type: Number, required: true },
  note: { type: String },
  donationType: { type: String, default: 'cash' }, // "cash", "cheque", or "upi"
  bankName: { type: String },
  chequeNumber: { type: String },
  upiTransactionId: { type: String },
  aadharCard: { type: String },
  panCard: { type: String },
  status: { type: String, default: 'collected' },
  createdAt: { type: Date, default: Date.now },
  receiptNumber: { type: String },
  isDeleted: { type: Boolean, default: false },
  depositAcknowledged: { type: Boolean, default: false },
  depositNote: { type: String, default: "" },
  depositVerified: { type: Boolean, default: false },
  depositVerifiedAt: { type: Date },
  depositVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Receipt auto-generation
cashDonationSchema.pre('save', async function(next) {
  if (!this.isNew || this.receiptNumber) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "volunteerReceipt" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqNumber = counter.seq.toString().padStart(6, '0');
    this.receiptNumber = `JMB${seqNumber}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('CashDonation', cashDonationSchema);
