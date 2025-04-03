// backend/routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public endpoint: Submit an inquiry from About/Contact pages
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, country, comments, source } = req.body;
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      country,
      comments,
      source
    });
    res.status(201).json(inquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error submitting inquiry" });
  }
});

// Admin endpoint: Get all inquiries (accessible to admin and master_admin)
router.get('/', authenticate, authorizeRoles('master_admin', 'admin'), async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 })
      .populate('assignedAdmin', 'username email');
    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching inquiries" });
  }
});

// Admin endpoint: Update inquiry status, assign admin, and add remarks
router.patch('/:id/status', authenticate, authorizeRoles('master_admin', 'admin'), async (req, res) => {
  try {
    const { status, remark } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    // If the inquiry is already assigned to a different admin, disallow update
    if (inquiry.assignedAdmin && inquiry.assignedAdmin.toString() !== req.user._id) {
      return res.status(400).json({ error: "Inquiry is already being handled by another admin." });
    }
    // Assign the current admin if not already assigned
    if (!inquiry.assignedAdmin) {
      inquiry.assignedAdmin = req.user._id;
    }
    // Update status if provided
    if (status) {
      inquiry.status = status;
    }
    // Add admin remark if provided
    if (remark) {
      inquiry.adminRemarks.push({
        admin: req.user._id,
        remark
      });
    }
    await inquiry.save();
    res.json({ message: "Inquiry updated", inquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating inquiry" });
  }
});

module.exports = router;
