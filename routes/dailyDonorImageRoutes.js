// backend/routes/dailyDonorImageRoutes.js
const express = require('express');
const router = express.Router();

const {
  uploadDailyDonorImage,
  getAllDailyDonorImages,
  deleteDonorImage,
  updateDonorImage,
} = require('../controllers/dailyDonorImageController');

const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

/**
 * GET all daily donor images
 */
router.get('/', getAllDailyDonorImages);

/**
 * POST single daily donor image (admin, master_admin, graphics)
 */
router.post(
  '/upload',
  authenticate,
  authorizeRoles('master_admin', 'admin', 'graphics'),
  upload.single('image'),
  uploadDailyDonorImage
);

/**
 * DELETE a donor image (admin, master_admin, graphics)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('master_admin', 'admin', 'graphics'),
  deleteDonorImage
);

/**
 * UPDATE a donor image (admin, master_admin, graphics)
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('master_admin', 'admin', 'graphics'),
  upload.single('image'),
  updateDonorImage
);

module.exports = router;
