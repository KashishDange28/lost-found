const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  item: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  location: {
    type: String,
    required: true
  },
  contactInfo: {
    type: String,
    required: function() {
      return this.type === 'found';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }
}, {
  timestamps: true
});

reportSchema.statics.matchReports = async function(foundReportId) {
  const foundReport = await this.findById(foundReportId);
  if (!foundReport) {
    throw new Error('Found report not found');
  }

  // Find matching lost reports
  const matchingLostReports = await this.find({
    type: 'lost',
    item: {
      name: new RegExp(foundReport.item.name, 'i'),
      description: new RegExp(foundReport.item.description, 'i')
    },
    location: new RegExp(foundReport.location, 'i'),
    status: 'pending'
  });

  if (matchingLostReports.length > 0) {
    // Update found report status
    await this.findByIdAndUpdate(foundReportId, {
      status: 'resolved',
      matchedWith: matchingLostReports[0]._id
    });

    // Update matched lost report status
    await this.findByIdAndUpdate(matchingLostReports[0]._id, {
      status: 'resolved',
      matchedWith: foundReportId
    });

    // Create notifications for both users
    const Notification = require('./Notification');
    
    // Notification for lost item owner
    await Notification.create({
      user: matchingLostReports[0].user,
      type: 'match_found',
      message: `Your lost item "${foundReport.item.name}" has been found!`,
      report: matchingLostReports[0]._id
    });

    // Notification for found item reporter
    await Notification.create({
      user: foundReport.user,
      type: 'item_found',
      message: `Thank you for reporting! The owner of "${foundReport.item.name}" has been notified.`,
      report: foundReportId
    });
  }
};

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
