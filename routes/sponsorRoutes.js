// // backend/routes/sponsorRoutes.js
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const Sponsor = require('../models/Sponsor');

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Adjust destination path as needed
//     cb(null, path.join(__dirname, '../../uploads/sponsors'));
//   },
//   filename: function (req, file, cb) {
//     // Generate a unique suffix
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     // Preserve file extension
//     const ext = path.extname(file.originalname);
//     cb(null, uniqueSuffix + ext);
//   },
// });

// const upload = multer({ storage });

// // @route  GET /api/sponsors
// // @desc   Get all sponsors
// // @access Admin
// router.get('/', async (req, res) => {
//   try {
//     const sponsors = await Sponsor.find().sort({ createdAt: -1 });
//     res.json(sponsors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // @route  POST /api/sponsors
// // @desc   Create a sponsor (upload image file)
// // @access Admin
// router.post('/', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }
//     // Create a new sponsor doc with the filename
//     const sponsor = await Sponsor.create({ filename: req.file.filename });
//     res.json(sponsor);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // @route  DELETE /api/sponsors/:id
// // @desc   Delete a sponsor and remove its file from disk
// // @access Admin
// router.delete('/:id', async (req, res) => {
//   try {
//     const sponsor = await Sponsor.findById(req.params.id);
//     if (!sponsor) {
//       return res.status(404).json({ error: 'Sponsor not found' });
//     }

//     // Path to the file on disk
//     const filePath = path.join(__dirname, '../../uploads/sponsors', sponsor.filename);
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     // Delete from MongoDB
//     await sponsor.remove();
//     res.json({ message: 'Sponsor deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;

// backend/routes/sponsorRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Sponsor = require('../models/Sponsor');

// Define the absolute path for the sponsors upload directory
const uploadDir = path.join(__dirname, '../../uploads/sponsors');

// Configure multer storage with automatic directory creation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique suffix and preserve the file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// @route  GET /api/sponsors
// @desc   Get the current sponsor image (if any)
// @access Admin
router.get('/', async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    res.json(sponsors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route  POST /api/sponsors
// @desc   Create a sponsor image (upload image file) if one doesn't already exist
// @access Admin
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Check if a sponsor image already exists
    const count = await Sponsor.countDocuments();
    if (count > 0) {
      return res.status(400).json({ error: 'Only one sponsor image is allowed. Please delete the existing image first.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Create a new sponsor document with the filename
    const sponsor = await Sponsor.create({ filename: req.file.filename });
    res.json(sponsor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route  DELETE /api/sponsors/:id
// @desc   Delete a sponsor image and remove its file from disk
// @access Admin
router.delete('/:id', async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    // Path to the file on disk
    const filePath = path.join(uploadDir, sponsor.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Use deleteOne instead of remove
    await sponsor.deleteOne();
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
