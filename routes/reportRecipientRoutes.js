// backend/routes/reportRecipientRoutes.js
const express = require('express');
const router = express.Router();
const ReportRecipient = require('../models/ReportRecipient');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// CREATE a new recipient – only master_admin
router.post('/', authenticate, authorizeRoles('master_admin'), async (req, res) => {
  try {
    const { email, frequency, formats } = req.body;
    const existing = await ReportRecipient.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists in recipient list' });
    }
    const newRecipient = await ReportRecipient.create({ email, frequency, formats });
    res.json(newRecipient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating recipient' });
  }
});

// READ all recipients – only master_admin
router.get('/', authenticate, authorizeRoles('master_admin'), async (req, res) => {
  try {
    const recipients = await ReportRecipient.find().sort({ createdAt: -1 });
    res.json(recipients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching recipients' });
  }
});

// UPDATE a recipient – only master_admin
router.put('/:id', authenticate, authorizeRoles('master_admin'), async (req, res) => {
  try {
    const { email, frequency, formats } = req.body;
    const updated = await ReportRecipient.findByIdAndUpdate(
      req.params.id,
      { email, frequency, formats },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating recipient' });
  }
});

// DELETE a recipient – only master_admin
router.delete('/:id', authenticate, authorizeRoles('master_admin'), async (req, res) => {
  try {
    const removed = await ReportRecipient.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    res.json({ message: 'Recipient removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting recipient' });
  }
});

module.exports = router;
