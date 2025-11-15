const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Use the same multer storage as reports
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Assumes 'uploads' folder exists in 'server'
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- THIS IS THE UPDATED PROFILE ROUTE ---
// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone, branch, year, enrollmentNo } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // --- BETTER UPDATE LOGIC ---
    // Only update fields that were actually sent
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (branch) updateFields.branch = branch;
    if (year) updateFields.year = year;
    if (enrollmentNo) updateFields.enrollmentNo = enrollmentNo;

    // Check if a new profile image was uploaded
    if (req.file) {
      updateFields.profileImageUrl = req.file.path;
    }
    // -------------------------

    // Update and save the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true } // This returns the modified document
    ).select('-password'); // Don't send the password back

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;