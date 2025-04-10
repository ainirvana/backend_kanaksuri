// backend/controllers/dailyDonorImageController.js
const fs = require('fs');
const path = require('path');
const DailyDonorImage = require('../models/DailyDonorImage');

/**
 * Upload a single image for daily donors
 */
exports.uploadDailyDonorImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newImage = new DailyDonorImage({
      filename: req.file.filename,
      path: req.file.path,
    });

    const savedImage = await newImage.save();
    return res.status(200).json({
      msg: 'Daily donor image uploaded successfully',
      image: savedImage,
    });
  } catch (err) {
    console.error('Error uploading daily donor image:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * Get all daily donor images (sorted newest first)
 */
exports.getAllDailyDonorImages = async (req, res) => {
  try {
    const images = await DailyDonorImage.find().sort({ createdAt: -1 });
    return res.status(200).json(images);
  } catch (err) {
    console.error('Error fetching daily donor images:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * Delete a daily donor image by ID
 */
exports.deleteDonorImage = async (req, res) => {
  console.log('deleteDonorImage called with ID:', req.params.id);
  try {
    const { id } = req.params;
    const image = await DailyDonorImage.findById(id);
    if (!image) {
      console.log('No image found with ID:', id);
      return res.status(404).json({ error: 'Image not found' });
    }

    // Attempt file removal from disk
    try {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
        console.log('File removed from disk:', image.path);
      } else {
        console.log('File not found on disk:', image.path);
      }
    } catch (fsErr) {
      console.error('Error removing file from disk:', fsErr);
      // Not fatal for the DB removal
    }

    // Now remove the doc from the DB (Mongoose 7 uses deleteOne(), remove() no longer exists)
    console.log('Removing doc from DB with ID:', image._id);
    await image.deleteOne();
    console.log('Successfully removed doc from DB');

    return res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting donor image:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * Update a daily donor image (re-upload file or add fields like "description").
 */
exports.updateDonorImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body; // if you want additional fields

    const image = await DailyDonorImage.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (req.file) {
      try {
        if (fs.existsSync(image.path)) {
          fs.unlinkSync(image.path);
        }
      } catch (fsErr) {
        console.error('Error removing old file:', fsErr);
      }
      image.filename = req.file.filename;
      image.path = req.file.path;
    }

    if (description !== undefined) {
      image.description = description;
    }

    await image.save();
    return res.json({ msg: 'Image updated successfully', image });
  } catch (err) {
    console.error('Error updating donor image:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};
