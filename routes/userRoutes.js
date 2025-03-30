// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CashDonation = require('../models/CashDonation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import authentication and role-based middleware
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// -----------------------------------------------------------------
// Register new user (only admin users can register new accounts)
// - If the requested role is other than 'volunteer', only master_admin can assign it.
// -----------------------------------------------------------------
router.post('/register', authenticate, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    // Check if user exists
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    // If role is provided and is not 'volunteer', only master_admin can assign it.
    if (role && role !== 'volunteer' && req.user.role !== 'master_admin') {
      return res.status(403).json({ error: "Only master admin can create admin accounts" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user with provided role or default to 'volunteer'
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'volunteer',
      firstTime: true
    });
    const userObj = newUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Login route (shared for admin/volunteer)
// - Generates a JWT token and returns it along with the user data.
// -----------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
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
    // Generate JWT token with user id and role; expires in 1 day
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: '1d' }
    );
    user.password = undefined;
    res.json({
      user,
      token,
      firstTime: user.firstTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// List all users – accessible only to master_admin and admin
// -----------------------------------------------------------------
router.get('/', authenticate, authorizeRoles('master_admin', 'admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Update user's password
// - For self-update, the current password must be supplied.
// - For admin reset (reset flag true), only master_admin is allowed.
// -----------------------------------------------------------------
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { password, newPassword, reset } = req.body;
    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (reset) {
      if (req.user.role !== 'master_admin') {
        return res.status(403).json({ error: "Not authorized to reset password" });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.firstTime = false;
      await user.save();
      return res.json({ message: "Password reset successful" });
    } else {
      // Self-update: ensure the user is updating only their own password
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ error: "Not authorized to update password for this user" });
      }
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

// -----------------------------------------------------------------
// Remove user – Only master_admin can delete admin accounts,
// and non-master_admin users cannot delete a master_admin.
// -----------------------------------------------------------------
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }
    if (userToDelete.role === 'master_admin' && req.user.role !== 'master_admin') {
      return res.status(403).json({ error: "Not authorized to delete master admin" });
    }
    if (userToDelete.role !== 'volunteer' && req.user.role !== 'master_admin') {
      return res.status(403).json({ error: "Not authorized to delete admin accounts" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Volunteer adds a cash donation
// - Ensure that a volunteer can only add donations for themselves
// -----------------------------------------------------------------
router.post('/cash-donation', authenticate, async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      email,
      city,
      amount,
      note,
      donationType,
      bankName,
      chequeNumber,
      upiTransactionId,
      aadharCard,
      panCard
    } = req.body;

    if (req.user.role === 'volunteer' && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to add donation for another user" });
    }
    const donation = await CashDonation.create({
      volunteer: userId,
      name,
      phone,
      email,
      city,
      amount,
      note,
      donationType: donationType || 'cash',
      bankName: donationType === 'cheque' ? bankName : undefined,
      chequeNumber: donationType === 'cheque' ? chequeNumber : undefined,
      upiTransactionId: donationType === 'upi' ? upiTransactionId : undefined,
      aadharCard,
      panCard,
      status: 'collected'
    });
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Volunteer updates deposit acknowledgment for a single donation
// (Used for one donation ID at a time)
// -----------------------------------------------------------------
router.patch('/cash-donation/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const { depositNote } = req.body;
    const donation = await CashDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    // Ensure volunteer owns this donation
    if (req.user.role === 'volunteer' && req.user._id.toString() !== donation.volunteer.toString()) {
      return res.status(403).json({ error: "Not authorized to update this donation" });
    }
    donation.depositAcknowledged = true;
    donation.depositNote = depositNote;
    await donation.save();
    res.json({ message: "Deposit acknowledgment updated", donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// BATCH deposit acknowledgment for multiple donation IDs
// e.g. volunteer marks multiple donations as deposited at once
// -----------------------------------------------------------------
router.patch('/cash-donations/acknowledge', authenticate, async (req, res) => {
  try {
    const { donationIds, depositNote } = req.body;
    if (!donationIds || !Array.isArray(donationIds)) {
      return res.status(400).json({ error: "donationIds must be an array" });
    }
    for (const id of donationIds) {
      const donation = await CashDonation.findById(id);
      if (!donation) continue; // skip if not found
      // If volunteer, ensure donation belongs to them
      if (req.user.role === 'volunteer' && String(donation.volunteer) !== String(req.user._id)) {
        // skip or throw error; here we skip
        continue;
      }
      donation.depositAcknowledged = true;
      donation.depositNote = depositNote;
      await donation.save();
    }
    res.json({ message: "Acknowledge operation complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Admin verifies deposit for a cash donation
// - Only master_admin or accounts users can verify deposit.
// -----------------------------------------------------------------
router.patch('/cash-donation/:id/verify-deposit', authenticate, authorizeRoles('master_admin', 'accounts'), async (req, res) => {
  try {
    const donation = await CashDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    donation.depositVerified = true;
    donation.depositVerifiedAt = new Date();
    donation.depositVerifiedBy = req.user._id;
    await donation.save();
    res.json({ message: "Deposit verified", donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Admin soft deletes a cash donation (marks as deleted)
// -----------------------------------------------------------------
router.patch('/cash-donation/:id/delete', authenticate, authorizeRoles('master_admin', 'admin'), async (req, res) => {
  try {
    const donation = await CashDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    donation.isDeleted = true;
    await donation.save();
    res.json({ message: "Donation marked as deleted", donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Admin gets all cash donations
// -----------------------------------------------------------------
router.get('/cash-donations', authenticate, authorizeRoles('master_admin', 'admin', 'accounts'), async (req, res) => {
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

// -----------------------------------------------------------------
// Volunteer gets their own cash donations
// -----------------------------------------------------------------
router.get('/my-cash-donations/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'volunteer' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: "Not authorized to view these donations" });
    }
    const donations = await CashDonation.find({ volunteer: req.params.userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------------------------------------------
// Get a single cash donation by ID for shareable receipt link
// -----------------------------------------------------------------
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


