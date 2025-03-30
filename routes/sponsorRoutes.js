// backend/routes/sponsorRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Sponsor = require('../models/Sponsor');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const uploadDir = path.join(__dirname, '../uploads/sponsors');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

/**
 * 1) PUBLIC READ route – Anyone can list sponsor(s)
 *    so that volunteers can display sponsor images in receipts
 *    without "No sponsor found" / unauthorized error.
 */
router.get('/public', async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    res.json(sponsors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching public sponsor' });
  }
});

/**
 * 2) Protected GET route – master_admin/graphics can manage sponsor images
 */
router.get('/', authenticate, authorizeRoles('master_admin', 'graphics'), async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    res.json(sponsors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * 3) POST – only master_admin/graphics can upload a new sponsor image
 */
router.post('/', authenticate, authorizeRoles('master_admin', 'graphics'), upload.single('image'), async (req, res) => {
  try {
    const count = await Sponsor.countDocuments();
    if (count > 0) {
      return res.status(400).json({ error: 'Only one sponsor image is allowed. Please delete the existing one first.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const sponsor = await Sponsor.create({ filename: req.file.filename });
    res.json(sponsor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * 4) DELETE – only master_admin/graphics can delete the sponsor image
 */
router.delete('/:id', authenticate, authorizeRoles('master_admin', 'graphics'), async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }
    const filePath = path.join(uploadDir, sponsor.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await sponsor.deleteOne();
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
