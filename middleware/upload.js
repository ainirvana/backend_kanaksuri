// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in 'uploads/dailyDonors' folder (you can change it if you want).
    cb(null, 'uploads/dailyDonors/');
  },
  filename: (req, file, cb) => {
    // Example: dailyDonor-16809123377.png
    const uniqueName =
      'dailyDonor-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Create the multer instance
const upload = multer({ storage });

module.exports = upload;
