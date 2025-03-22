// // backend/routes/userRoutes.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const CashDonation = require('../models/CashDonation');
// const bcrypt = require('bcryptjs');

// // Register new user (admin can register volunteer or admin)
// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, password, role } = req.body;
//     // Check if user exists
//     const existing = await User.findOne({ $or: [{ username }, { email }] });
//     if (existing) {
//       return res.status(400).json({ error: "User already exists" });
//     }
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Create user
//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       role,           // 'admin' or 'volunteer'
//       firstTime: true // Force first-time password update if needed
//     });
//     // Remove password field before sending response
//     const userObj = newUser.toObject();
//     delete userObj.password;
//     res.json(userObj);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Login route (shared for admin/volunteer)
// router.post('/login', async (req, res) => {
//   try {
//     const { usernameOrEmail, password } = req.body;
//     // Because password is set to select: false, explicitly select it here
//     const user = await User.findOne({
//       $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
//     }).select('+password');
//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
//     // Remove password field before sending response
//     user.password = undefined;
//     res.json({
//       user,
//       firstTime: user.firstTime
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // List all users (Admin only) – In production, protect this route further.
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find().select('-password').sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Update user's password
// router.put('/:id', async (req, res) => {
//   try {
//     const { password, newPassword, reset } = req.body;
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     if (reset) {
//       // Admin resets password
//       const hashed = await bcrypt.hash(newPassword, 10);
//       user.password = hashed;
//       user.firstTime = false;
//       await user.save();
//       return res.json({ message: "Password reset successful" });
//     } else {
//       // User self-update: must supply current password
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(400).json({ error: "Current password incorrect" });
//       }
//       const hashed = await bcrypt.hash(newPassword, 10);
//       user.password = hashed;
//       user.firstTime = false;
//       await user.save();
//       return res.json({ message: "Password updated successfully" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Remove user (Admin only)
// router.delete('/:id', async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User removed successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Volunteer (user) adds a donation (cash, cheque, or UPI)
// router.post('/cash-donation', async (req, res) => {
//   try {
//     const { 
//       userId, 
//       name, 
//       phone, 
//       email, 
//       amount, 
//       note, 
//       donationType, 
//       bankName, 
//       chequeNumber, 
//       upiTransactionId, 
//       aadharCard, 
//       panCard 
//     } = req.body;
    
//     const donation = await CashDonation.create({
//       volunteer: userId,
//       name,
//       phone,
//       email,
//       amount,
//       note,
//       donationType: donationType || 'cash',
//       bankName: donationType === 'cheque' ? bankName : undefined,
//       chequeNumber: donationType === 'cheque' ? chequeNumber : undefined,
//       upiTransactionId: donationType === 'upi' ? upiTransactionId : undefined,
//       aadharCard, // new optional field
//       panCard,    // new optional field
//       status: 'collected'
//     });
//     res.json(donation);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Admin gets all cash donations
// router.get('/cash-donations', async (req, res) => {
//   try {
//     const cashDonations = await CashDonation.find()
//       .sort({ createdAt: -1 })
//       .populate('volunteer', 'username role');
//     res.json(cashDonations);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Volunteer gets their own cash donations
// router.get('/my-cash-donations/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const donations = await CashDonation.find({ volunteer: userId }).sort({ createdAt: -1 });
//     res.json(donations);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Get a single cash donation by ID for shareable receipt link
// router.get('/cash-donation/:id', async (req, res) => {
//   try {
//     const donation = await CashDonation.findById(req.params.id)
//       .populate('volunteer', 'username role');
//     if (!donation) {
//       return res.status(404).json({ error: "Donation not found" });
//     }
//     res.json(donation);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;

// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CashDonation = require('../models/CashDonation');
const bcrypt = require('bcryptjs');

// Register new user (admin can register volunteer or admin)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    // Check if user exists
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,           // 'admin' or 'volunteer'
      firstTime: true // Force first-time password update if needed
    });
    // Remove password field before sending response
    const userObj = newUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route (shared for admin/volunteer)
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    // Because password is set to select: false, explicitly select it here
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    }).select('+password');
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Remove password field before sending response
    user.password = undefined;
    res.json({
      user,
      firstTime: user.firstTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List all users (Admin only) – In production, protect this route further.
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user's password
router.put('/:id', async (req, res) => {
  try {
    const { password, newPassword, reset } = req.body;
    // IMPORTANT: select('+password') so we can compare the current password
    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (reset) {
      // Admin resets password
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.firstTime = false;
      await user.save();
      return res.json({ message: "Password reset successful" });
    } else {
      // User self-update: must supply current password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password incorrect" });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.firstTime = false;
      await user.save();
      return res.json({ message: "Password updated successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove user (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Volunteer (user) adds a donation (cash, cheque, or UPI)
router.post('/cash-donation', async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      email,
      amount,
      note,
      donationType,
      bankName,
      chequeNumber,
      upiTransactionId,
      aadharCard,
      panCard
    } = req.body;

    const donation = await CashDonation.create({
      volunteer: userId,
      name,
      phone,
      email,
      amount,
      note,
      donationType: donationType || 'cash',
      bankName: donationType === 'cheque' ? bankName : undefined,
      chequeNumber: donationType === 'cheque' ? chequeNumber : undefined,
      upiTransactionId: donationType === 'upi' ? upiTransactionId : undefined,
      aadharCard, // new optional field
      panCard,    // new optional field
      status: 'collected'
    });
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin gets all cash donations
router.get('/cash-donations', async (req, res) => {
  try {
    const cashDonations = await CashDonation.find()
      .sort({ createdAt: -1 })
      .populate('volunteer', 'username role');
    res.json(cashDonations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Volunteer gets their own cash donations
router.get('/my-cash-donations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const donations = await CashDonation.find({ volunteer: userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single cash donation by ID for shareable receipt link
router.get('/cash-donation/:id', async (req, res) => {
  try {
    const donation = await CashDonation.findById(req.params.id)
      .populate('volunteer', 'username role');
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
