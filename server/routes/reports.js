const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const { type, item, location, contactInfo } = req.body;
    
    console.log('Creating new report with data:', {
      type,
      item,
      location,
      contactInfo,
      userId: req.user.id
    });
    
    const report = new Report({
      type,
      item,
      location,
      contactInfo: type === 'found' ? contactInfo : undefined,
      user: req.user.id
    });

    await report.save();
    console.log('Report saved successfully:', report._id);

    // Find matches and send notifications
    console.log('Calling findMatchesAndNotify...');
    await req.app.locals.findMatchesAndNotify(report);
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

// Get all user's reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json({
      success: true,
      reports
    });
  } catch (error) {
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

    if (report.user._id.toString() !== req.user.id) {
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

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('report', 'item status')
      .populate('matchedReport', 'item status')
      .populate('user', 'name email');
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications. Please try again later.'
    });
  }
});

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

    let matchingReports;
    
    if (report.type === 'found') {
      // Find lost reports that match this found item
      matchingReports = await Report.find({
        type: 'lost',
        status: 'active',
        item: { $regex: new RegExp(report.item, 'i') },
        _id: { $ne: report._id }
      }).populate('user', 'name email');
    } else if (report.type === 'lost') {
      // Find found reports that match this lost item
      matchingReports = await Report.find({
        type: 'found',
        status: 'active',
        item: { $regex: new RegExp(report.item, 'i') },
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
    
    // Get all reports from database
    const allReports = await Report.find({}).populate('user', 'name email');
    console.log('Total reports in database:', allReports.length);
    
    // Show all reports
    allReports.forEach((report, index) => {
      console.log(`Report ${index + 1}:`, {
        id: report._id,
        type: report.type,
        item: report.item,
        user: report.user.name,
        email: report.user.email,
        status: report.status
      });
    });
    
    // Test matching logic
    const matches = [];
    
    for (let i = 0; i < allReports.length; i++) {
      const report1 = allReports[i];
      
      for (let j = i + 1; j < allReports.length; j++) {
        const report2 = allReports[j];
        
        // Only match if one is lost and one is found
        if (report1.type !== report2.type) {
          const item1Name = typeof report1.item === 'string' ? report1.item : report1.item.name;
          const item1Desc = typeof report1.item === 'string' ? '' : report1.item.description;
          const item2Name = typeof report2.item === 'string' ? report2.item : report2.item.name;
          const item2Desc = typeof report2.item === 'string' ? '' : report2.item.description;
          
          // Simple keyword matching
          const keywords1 = [...item1Name.toLowerCase().split(' '), ...item1Desc.toLowerCase().split(' ')].filter(k => k.length > 2);
          const keywords2 = [...item2Name.toLowerCase().split(' '), ...item2Desc.toLowerCase().split(' ')].filter(k => k.length > 2);
          
          const commonKeywords = keywords1.filter(k => keywords2.includes(k));
          
          if (commonKeywords.length > 0) {
            matches.push({
              report1: {
                id: report1._id,
                type: report1.type,
                item: item1Name,
                user: report1.user.name,
                email: report1.user.email
              },
              report2: {
                id: report2._id,
                type: report2.type,
                item: item2Name,
                user: report2.user.name,
                email: report2.user.email
              },
              commonKeywords
            });
            
            console.log('MATCH FOUND:', {
              item1: item1Name,
              item2: item2Name,
              keywords: commonKeywords
            });
          }
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
  try {
    console.log('=== TESTING MATCHING LOGIC ===');
    
    // Get all reports
    const allReports = await Report.find({}).populate('user', 'name email');
    console.log('All reports in database:', allReports.length);
    
    allReports.forEach((report, index) => {
      console.log(`Report ${index + 1}:`, {
        id: report._id,
        type: report.type,
        item: report.item,
        user: report.user.name,
        status: report.status
      });
    });
    
    // Test matching logic
    if (allReports.length > 0) {
      const testReport = allReports[0];
      console.log('Testing matching for report:', testReport._id);
      
      // Simulate the matching logic
      let newItemName = '';
      let newItemDescription = '';
      
      if (typeof testReport.item === 'string') {
        newItemName = testReport.item;
      } else if (testReport.item && typeof testReport.item === 'object') {
        newItemName = testReport.item.name || '';
        newItemDescription = testReport.item.description || '';
      }
      
      console.log('Test report item name:', newItemName);
      console.log('Test report item description:', newItemDescription);
      
      const searchCriteria = {
        type: testReport.type === 'lost' ? 'found' : 'lost',
        status: 'active',
        _id: { $ne: testReport._id }
      };
      
      const orConditions = [];
      
      if (newItemName) {
        orConditions.push({ 'item.name': { $regex: new RegExp(newItemName, 'i') } });
        orConditions.push({ item: { $regex: new RegExp(newItemName, 'i') } });
      }
      
      if (newItemDescription) {
        orConditions.push({ 'item.description': { $regex: new RegExp(newItemDescription, 'i') } });
      }
      
      if (orConditions.length > 0) {
        searchCriteria.$or = orConditions;
      }
      
      console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));
      
      const matchingReports = await Report.find(searchCriteria).populate('user', 'name email');
      console.log('Found matching reports:', matchingReports.length);
      
      matchingReports.forEach((match, index) => {
        console.log(`Match ${index + 1}:`, {
          id: match._id,
          type: match.type,
          item: match.item,
          user: match.user.name
        });
      });
    }
    
    res.json({
      success: true,
      message: 'Check server console for matching test results',
      totalReports: allReports.length
    });
    
  } catch (error) {
    console.error('Error in test matching:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

module.exports = router;
