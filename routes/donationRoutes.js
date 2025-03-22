// // backend/routes/donationRoutes.js
// const express = require('express');
// const router = express.Router();
// const Donation = require('../models/Donation');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_yLXfTesrM8rT7h",
//   key_secret: process.env.RAZORPAY_KEY_SECRET || "DC9YjsU1TD3rhT909pjmeJDf",
// });

// // Create Order Endpoint
// router.post('/create-order', async (req, res) => {
//   try {
//     // Extract the new optional fields along with existing ones
//     const { name, whatsapp, email, amount, note, aadharCard, panCard } = req.body;
//     const donation = await Donation.create({
//       name,
//       whatsapp,
//       email,
//       amount,
//       note,
//       aadharCard,
//       panCard,
//       status: 'created'
//     });
//     const amountPaise = Number(amount) * 100;
//     const options = {
//       amount: amountPaise,
//       currency: "INR",
//       receipt: donation._id.toString(),
//       payment_capture: 1,
//     };
//     const order = await razorpayInstance.orders.create(options);
//     donation.order_id = order.id;
//     await donation.save();
//     res.json({
//       key: process.env.RAZORPAY_KEY_ID || "rzp_test_yLXfTesrM8rT7h",
//       order_id: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Unable to create order" });
//   }
// });

// // Verify Payment Endpoint
// router.post('/verify-payment', async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const donation = await Donation.findOne({ order_id: razorpay_order_id });
//     if (!donation) {
//       return res.status(400).json({ success: false, error: "Donation record not found" });
//     }
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "DC9YjsU1TD3rhT909pjmeJDf");
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest('hex');
//     if (generatedSignature === razorpay_signature) {
//       donation.payment_id = razorpay_payment_id;
//       donation.razorpay_signature = razorpay_signature;
//       donation.status = 'paid';
//       const randomSix = Math.floor(100000 + Math.random() * 900000);
//       donation.receiptNumber = `RCPT-${randomSix}`;
//       await donation.save();
//       return res.json({ success: true, donation });
//     } else {
//       return res.status(400).json({ success: false, error: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "Payment verification failed" });
//   }
// });

// // Get all donations (admin usage)
// router.get('/all', async (req, res) => {
//   try {
//     const donations = await Donation.find().sort({ createdAt: -1 });
//     res.json(donations);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;


// backend/routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_yLXfTesrM8rT7h",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "DC9YjsU1TD3rhT909pjmeJDf",
});

// Create Order Endpoint
router.post('/create-order', async (req, res) => {
  try {
    // Extract the new optional fields along with existing ones
    const { name, whatsapp, email, amount, note, aadharCard, panCard } = req.body;
    const donation = await Donation.create({
      name,
      whatsapp,
      email,
      amount,
      note,
      aadharCard,
      panCard,
      status: 'created'
    });
    const amountPaise = Number(amount) * 100;
    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: donation._id.toString(),
      payment_capture: 1,
    };
    const order = await razorpayInstance.orders.create(options);
    donation.order_id = order.id;
    await donation.save();
    res.json({
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_yLXfTesrM8rT7h",
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create order" });
  }
});

// Verify Payment Endpoint
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const donation = await Donation.findOne({ order_id: razorpay_order_id });
    if (!donation) {
      return res.status(400).json({ success: false, error: "Donation record not found" });
    }
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "DC9YjsU1TD3rhT909pjmeJDf");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature === razorpay_signature) {
      donation.payment_id = razorpay_payment_id;
      donation.razorpay_signature = razorpay_signature;
      donation.status = 'paid';
      const randomSix = Math.floor(100000 + Math.random() * 900000);
      donation.receiptNumber = `RCPT-${randomSix}`;
      await donation.save();
      return res.json({ success: true, donation });
    } else {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Payment verification failed" });
  }
});

// Get all donations (admin usage)
router.get('/all', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// NEW: Get donation by ID for shareable receipt link
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
