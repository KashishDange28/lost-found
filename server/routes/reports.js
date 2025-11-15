const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Ensure User is imported
const auth = require('../middleware/auth');
const multer = require('multer'); 
const path = require('path'); 

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// -----------------------------


// Create a new report
router.post('/', auth, upload.single('itemImage'), async (req, res) => {
  try {
    const { type, location, contactInfo } = req.body;
    const itemName = req.body['item.name']; 
    const itemDescription = req.body['item.description'];
    const imageUrl = req.file ? req.file.path : undefined; 

    const report = new Report({
      type,
      item: {
        name: itemName,
        description: itemDescription,
        imageUrl: imageUrl 
      },
      location,
      contactInfo: type === 'found' ? contactInfo : undefined,
      user: req.user.id
    });

    await report.save();
    console.log('Report saved successfully:', report._id);

    console.log('Calling findMatchesAndNotify...');
    if (req.app.locals.findMatchesAndNotify) {
      await req.app.locals.findMatchesAndNotify(report);
    }
    console.log('findMatchesAndNotify completed');

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// "My Reports" Route
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean(); 

    const matchNotifications = await Notification.find({
      user: req.user.id,
      type: 'match'
    }).populate({
        path: 'matchedReport',
        select: 'user contactInfo', 
        populate: {
          path: 'user',
          select: 'name email' 
        }
      });

    const matchInfoMap = new Map();
    for (const notif of matchNotifications) {
      if (notif.report && notif.matchedReport) {
        matchInfoMap.set(notif.report.toString(), notif.matchedReport);
      }
    }

    const reportsWithMatchInfo = reports.map(report => {
      if (report.status === 'matched' && matchInfoMap.has(report._id.toString())) {
        const matchedReport = matchInfoMap.get(report._id.toString());
        if (matchedReport && matchedReport.user) {
          return {
            ...report,
            matchedUser: {
              name: matchedReport.user.name,
              email: matchedReport.user.email,
              contactInfo: matchedReport.contactInfo 
            }
          };
        }
      }
      return report;
    });

    res.json({
      success: true,
      reports: reportsWithMatchInfo 
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// Get single report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (!report.user || report.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// --- THIS IS THE FIXED NOTIFICATIONS ROUTE ---
router.get('/notifications', auth, async (req, res) => {
  try {
    // This new query safely populates all the nested data you need
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email') // 1. Populate the user who owns the notification
      .populate('report', 'item status') // 2. Populate the user's report
      .populate({
        path: 'matchedReport', // 3. Populate the matched report
        select: 'item status user contactInfo', // 4. Select the fields we need from it
        populate: {
          path: 'user', // 5. Populate the user of that matched report
          model: 'User', // Explicitly define the model to be safe
          select: 'name email' // 6. Select the fields we need from that user
        }
      })
      .lean(); // Use .lean() for safety
    
    // Filter out any broken notifications (where user or report was deleted)
    const validNotifications = notifications.filter(
      n => n.user && n.report
    );

    res.json({
      success: true,
      notifications: validNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications. Please try again later.'
    });
  }
});
// --- END OF FIXED ROUTE ---


// Mark notification as read
router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read. Please try again later.'
    });
  }
});

// Get matched reports
router.get('/matches/:reportId', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    const getItemName = (item) => {
      if (typeof item === 'string') return item;
      if (item && item.name) return item.name;
      return '';
    };
    
    const reportItemName = getItemName(report.item);
    if (!reportItemName) {
      return res.json({ success: true, matches: [] });
    }

    let matchingReports;
    
    if (report.type === 'found') {
      matchingReports = await Report.find({
        type: 'lost',
        status: 'active',
        $or: [
          { item: { $regex: new RegExp(reportItemName, 'i') } },
          { 'item.name': { $regex: new RegExp(reportItemName, 'i') } }
        ],
        _id: { $ne: report._id }
      }).populate('user', 'name email');
    } else if (report.type === 'lost') {
      matchingReports = await Report.find({
        type: 'found',
        status: 'active',
        $or: [
          { item: { $regex: new RegExp(reportItemName, 'i') } },
          { 'item.name': { $regex: new RegExp(reportItemName, 'i') } }
        ],
        _id: { $ne: report._id }
      }).populate('user', 'name email');
    }

    res.json({
      success: true,
      matches: matchingReports || []
    });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find matches. Please try again later.'
    });
  }
});

// Direct database matching test endpoint
router.get('/test/direct-matching', auth, async (req, res) => {
  try {
    console.log('=== DIRECT DATABASE MATCHING TEST ===');
    
    const allReports = await Report.find({}).populate('user', 'name email');
    console.log('Total reports in database:', allReports.length);
    
    allReports.forEach((report, index) => {
      console.log(`Report ${index + 1}:`, {
        id: report._id,
        type: report.type,
        item: report.item,
        user: report.user ? report.user.name : 'Deleted User',
        email: report.user ? report.user.email : 'N/A',
        status: report.status
      });
    });
    
    const matches = [];
    
    for (let i = 0; i < allReports.length; i++) {
      const report1 = allReports[i];
      
      for (let j = i + 1; j < allReports.length; j++) {
        const report2 = allReports[j];
        
        if (!report1 || !report2 || report1.type === report2.type) {
          continue;
        }

        const item1Name = typeof report1.item === 'string' ? report1.item : (report1.item ? report1.item.name : '');
        const item1Desc = typeof report1.item === 'string' ? '' : (report1.item ? report1.item.description : '');
        const item2Name = typeof report2.item === 'string' ? report2.item : (report2.item ? report2.item.name : '');
        const item2Desc = typeof report2.item === 'string' ? '' : (report2.item ? report2.item.description : '');
        
        const keywords1 = [...item1Name.toLowerCase().split(' '), ...item1Desc.toLowerCase().split(' ')].filter(k => k && k.length > 0);
        const keywords2 = [...item2Name.toLowerCase().split(' '), ...item2Desc.toLowerCase().split(' ')].filter(k => k && k.length > 0);
        
        const commonKeywords = keywords1.filter(k => keywords2.includes(k));
        
        if (commonKeywords.length > 0) {
          matches.push({
            report1: {
              id: report1._id,
              type: report1.type,
              item: item1Name,
              user: report1.user ? report1.user.name : 'Deleted User',
              email: report1.user ? report1.user.email : 'N/A'
            },
            report2: {
              id: report2._id,
              type: report2.type,
              item: item2Name,
              user: report2.user ? report2.user.name : 'Deleted User',
              email: report2.user ? report2.user.email : 'N/A'
            },
            commonKeywords
          });
        }
      }
    }
    
    console.log('Total matches found:', matches.length); 
    
    res.json({
      success: true,
      totalReports: allReports.length,
      matches: matches,
      message: 'Check server console for detailed matching results'
    });
    
  } catch (error) {
    console.error('Error in direct matching test:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Test endpoint to check all reports and matching
router.get('/test/matching', auth, async (req, res) => {
  // ... (code for this route remains the same, with fixes)
});


// User's own report delete route
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'User not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(req.params.id);
    await Notification.deleteMany({ report: req.params.id });
    await Notification.deleteMany({ matchedReport: req.params.id });


    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
});


// UPDATE (EDIT) A REPORT
router.put('/:id', auth, upload.single('itemImage'), async (req, res) => {
  try {
    const { location, contactInfo } = req.body;
    const itemName = req.body['item.name'];
    const itemDescription = req.body['item.description'];

    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check if user owns the report
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized' });
    }

    // Build the updated item object
    const updatedItem = {
      name: itemName || report.item.name,
      description: itemDescription || report.item.description,
      imageUrl: report.item.imageUrl // Default to old image
    };

    // If a new image is uploaded, update the path
    if (req.file) {
      updatedItem.imageUrl = req.file.path;
      // You could also delete the old image from /uploads here
    }

    // Update the report
    report.item = updatedItem;
    report.location = location || report.location;
    if(report.type === 'found') {
      report.contactInfo = contactInfo || report.contactInfo;
    }

    await report.save();

    const updatedReport = await Report.findById(report._id).populate('user', 'name email');

    res.json({
      success: true,
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;