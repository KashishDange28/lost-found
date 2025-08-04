const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all reports (admin only)
router.get('/all-reports', auth, adminAuth, async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Approve match (admin only)
router.post('/approve-match', auth, adminAuth, async (req, res) => {
  try {
    const { lostReportId, foundReportId } = req.body;
    
    if (!lostReportId || !foundReportId) {
      return res.status(400).json({
        success: false,
        message: 'Both lost and found report IDs are required'
      });
    }

    // Find the reports
    const lostReport = await Report.findById(lostReportId).populate('user', 'name email');
    const foundReport = await Report.findById(foundReportId).populate('user', 'name email');

    if (!lostReport || !foundReport) {
      return res.status(404).json({
        success: false,
        message: 'One or both reports not found'
      });
    }

    // Update report statuses
    lostReport.status = 'matched';
    foundReport.status = 'matched';
    
    await lostReport.save();
    await foundReport.save();

    // Create notifications for both users
    const lostNotification = new Notification({
      user: lostReport.user._id,
      type: 'match',
      title: 'Item Match Approved! 🎉',
      message: `Your lost item "${getItemName(lostReport.item)}" has been matched and approved by admin!`,
      report: lostReport._id,
      matchedReport: foundReport._id
    });

    const foundNotification = new Notification({
      user: foundReport.user._id,
      type: 'match',
      title: 'Item Match Approved! 🎉',
      message: `Your found item "${getItemName(foundReport.item)}" has been matched and approved by admin!`,
      report: foundReport._id,
      matchedReport: lostReport._id
    });

    await lostNotification.save();
    await foundNotification.save();

    // Send real-time notifications
    if (req.app.locals.sendNotification) {
      req.app.locals.sendNotification(lostReport.user._id.toString(), {
        type: 'match',
        title: 'Item Match Approved! 🎉',
        message: `Your lost item "${getItemName(lostReport.item)}" has been matched and approved by admin!`,
        notificationId: lostNotification._id,
        matchedUserInfo: {
          name: foundReport.user.name,
          email: foundReport.user.email,
          contactInfo: foundReport.contactInfo
        }
      });

      req.app.locals.sendNotification(foundReport.user._id.toString(), {
        type: 'match',
        title: 'Item Match Approved! 🎉',
        message: `Your found item "${getItemName(foundReport.item)}" has been matched and approved by admin!`,
        notificationId: foundNotification._id,
        matchedUserInfo: {
          name: lostReport.user.name,
          email: lostReport.user.email,
          contactInfo: lostReport.contactInfo
        }
      });
    }

    console.log(`Admin approved match between ${lostReport.user.email} and ${foundReport.user.email}`);

    res.json({
      success: true,
      message: 'Match approved successfully',
      lostReport,
      foundReport
    });

  } catch (error) {
    console.error('Error approving match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve match'
    });
  }
});

// Helper function to get item name
const getItemName = (item) => {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object' && item.name) return item.name;
  return 'Unknown Item';
};

module.exports = router; 