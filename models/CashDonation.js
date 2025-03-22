// // backend/models/CashDonation.js
// const mongoose = require('mongoose');

// const cashDonationSchema = new mongoose.Schema({
//   volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   name:      { type: String, required: true },
//   phone:     { type: String, required: true },
//   email:     { type: String },
//   amount:    { type: Number, required: true },
//   note:      { type: String },
//   donationType: { type: String, default: 'cash' }, // "cash", "cheque", or "upi"
//   bankName: { type: String },
//   chequeNumber: { type: String },
//   upiTransactionId: { type: String }, // New field for UPI donation
//   aadharCard: { type: String }, // new optional field
//   panCard: { type: String },    // new optional field
//   status:    { type: String, default: 'collected' },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('CashDonation', cashDonationSchema);

// backend/models/CashDonation.js
const mongoose = require('mongoose');
const Counter = require('./Counter');

const cashDonationSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  email:     { type: String },
  amount:    { type: Number, required: true },
  note:      { type: String },
  donationType: { type: String, default: 'cash' }, // "cash", "cheque", or "upi"
  bankName: { type: String },
  chequeNumber: { type: String },
  upiTransactionId: { type: String }, // New field for UPI donation
  aadharCard: { type: String }, // new optional field
  panCard: { type: String },    // new optional field
  status:    { type: String, default: 'collected' },
  createdAt: { type: Date, default: Date.now },
  receiptNumber: { type: String } // This field will store the generated receipt number
});

// Pre-save hook to generate a sequential receipt number for volunteer donations
cashDonationSchema.pre('save', async function(next) {
  // Only run for new documents and if receiptNumber is not set
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
