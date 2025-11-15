const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const nodemailer = require('nodemailer'); // <-- IMPORT NODEMAILER

// --- NODEMAILER TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // From .env file
    pass: process.env.EMAIL_PASS  // From .env file
  }
});

// Helper function to send email
const sendMatchEmail = async (toUser, fromUser, item, lostOrFound) => {
  const subject = `🎉 Your ${lostOrFound} item has been matched!`;
  const text = `
    Hello ${toUser.name},

    Great news! Your ${lostOrFound} item report for "${item.name}" has been approved by an admin.

    You can now contact the person who has your item:
    Name: ${fromUser.name}
    Email: ${fromUser.email}
    Contact Info: ${fromUser.contactInfo || 'Not provided'}

    Please reach out to them to arrange a hand-off.

    - KKW Lost & Found Team
  `;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>🎉 Match Found!</h2>
      <p>Hello ${toUser.name},</p>
      <p>Great news! Your <strong>${lostOrFound}</strong> item report for "<strong>${item.name}</strong>" has been approved by an admin.</p>
      <p>You can now contact the other user to arrange a hand-off:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
        <p><strong>Name:</strong> ${fromUser.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${fromUser.email}">${fromUser.email}</a></p>
        ${fromUser.contactInfo ? `<p><strong>Contact:</strong> ${fromUser.contactInfo}</p>` : ''}
      </div>
      <br/>
      <p>- KKW Lost & Found Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"KKW Lost & Found" <${process.env.EMAIL_USER}>`,
      to: toUser.email,
      subject: subject,
      text: text,
      html: html
    });
    console.log(`Email sent to ${toUser.email}`);
  } catch (error) {
    console.error(`Error sending email to ${toUser.email}:`, error);
  }
};
// --- END OF EMAIL SETUP ---


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

    const lostReport = await Report.findById(lostReportId).populate('user', 'name email');
    const foundReport = await Report.findById(foundReportId).populate('user', 'name email');

    if (!lostReport || !foundReport) {
      return res.status(404).json({
        success: false,
        message: 'One or both reports not found'
      });
    }
    
    if (!lostReport.user || !foundReport.user) {
      return res.status(404).json({
        success: false,
        message: 'One or both users associated with the reports no longer exist.'
      });
    }

    lostReport.status = 'matched';
    foundReport.status = 'matched';
    
    await lostReport.save();
    await foundReport.save();

    // --- SEND PUSH NOTIFICATIONS (as before) ---
    const lostNotification = new Notification({
      user: lostReport.user._id,
      type: 'match',
      title: 'Item Match Approved! 🎉',
      message: `Your lost item "${getItemName(lostReport.item)}" has been matched!`,
      report: lostReport._id,
      matchedReport: foundReport._id
    });
    // ... (rest of notification code) ...
    await lostNotification.save();
    
    const foundNotification = new Notification({
      user: foundReport.user._id,
      type: 'match',
      title: 'Item Match Approved! 🎉',
      message: `Your found item "${getItemName(foundReport.item)}" has been matched!`,
      report: foundReport._id,
      matchedReport: lostReport._id
    });
    await foundNotification.save();

    if (req.app.locals.sendNotification) {
      req.app.locals.sendNotification(lostReport.user._id.toString(), { /* ... */ });
      req.app.locals.sendNotification(foundReport.user._id.toString(), { /* ... */ });
    }
    
    // --- SEND EMAIL NOTIFICATIONS ---
    // Send email to the person who LOST the item
    await sendMatchEmail(
      lostReport.user,  // 'toUser'
      { name: foundReport.user.name, email: foundReport.user.email, contactInfo: foundReport.contactInfo }, // 'fromUser'
      lostReport.item,  // 'item'
      'lost'            // 'lostOrFound'
    );
    
    // Send email to the person who FOUND the item
    await sendMatchEmail(
      foundReport.user, // 'toUser'
      { name: lostReport.user.name, email: lostReport.user.email, contactInfo: null }, // 'fromUser' (lost reports have no public contact info)
      foundReport.item, // 'item'
      'found'           // 'lostOrFound'
    );
    // ---------------------------------

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


// ADMIN-ONLY DELETE ROUTE
router.delete('/report/:id', auth, adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await Report.findByIdAndDelete(req.params.id);
    await Notification.deleteMany({ report: req.params.id });
    await Notification.deleteMany({ matchedReport: req.params.id });

    console.log(`Admin deleted report ${req.params.id}`);
    
    res.json({
      success: true,
      message: 'Report deleted successfully by admin'
    });

  } catch (error) {
    console.error('Error deleting report by admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
});

module.exports = router;