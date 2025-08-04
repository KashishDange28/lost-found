require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');
const Report = require('./models/Report');
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://192.168.56.1:3000'],
    methods: ['GET', 'POST']
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their user ID
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Function to send notification to user
const sendNotification = (userId, notification) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
};

// Function to find matches and send notifications
const findMatchesAndNotify = async (newReport) => {
  try {
    console.log('Finding matches for new report:', newReport._id);
    
    let matchingReports;
    
    // Get the item name and description from the new report
    let newItemName = '';
    let newItemDescription = '';
    
    if (typeof newReport.item === 'string') {
      newItemName = newReport.item;
    } else if (newReport.item && typeof newReport.item === 'object') {
      newItemName = newReport.item.name || '';
      newItemDescription = newReport.item.description || '';
    }
    
    console.log('New report item name:', newItemName);
    console.log('New report item description:', newItemDescription);
    
    // Create keywords for better matching
    const newKeywords = [
      newItemName.toLowerCase(),
      newItemDescription.toLowerCase(),
      ...newItemName.toLowerCase().split(' '),
      ...newItemDescription.toLowerCase().split(' ')
    ].filter(keyword => keyword.length > 2); // Filter out short words
    
    console.log('Search keywords:', newKeywords);
    
    if (newReport.type === 'found') {
      // Find lost reports that match this found item
      const searchCriteria = {
        type: 'lost',
        status: 'active',
        _id: { $ne: newReport._id }
      };
      
      // Create an OR condition for matching
      const orConditions = [];
      
      // Add exact name matches
      if (newItemName) {
        orConditions.push({ 'item.name': { $regex: new RegExp(newItemName, 'i') } });
        orConditions.push({ item: { $regex: new RegExp(newItemName, 'i') } });
      }
      
      // Add keyword matches
      newKeywords.forEach(keyword => {
        if (keyword.length > 2) {
          orConditions.push({ 'item.name': { $regex: new RegExp(keyword, 'i') } });
          orConditions.push({ 'item.description': { $regex: new RegExp(keyword, 'i') } });
          orConditions.push({ item: { $regex: new RegExp(keyword, 'i') } });
        }
      });
      
      if (orConditions.length > 0) {
        searchCriteria.$or = orConditions;
      }
      
      console.log('Search criteria for lost reports:', JSON.stringify(searchCriteria, null, 2));
      
      matchingReports = await Report.find(searchCriteria).populate('user', 'name email');
    } else if (newReport.type === 'lost') {
      // Find found reports that match this lost item
      const searchCriteria = {
        type: 'found',
        status: 'active',
        _id: { $ne: newReport._id }
      };
      
      // Create an OR condition for matching
      const orConditions = [];
      
      // Add exact name matches
      if (newItemName) {
        orConditions.push({ 'item.name': { $regex: new RegExp(newItemName, 'i') } });
        orConditions.push({ item: { $regex: new RegExp(newItemName, 'i') } });
      }
      
      // Add keyword matches
      newKeywords.forEach(keyword => {
        if (keyword.length > 2) {
          orConditions.push({ 'item.name': { $regex: new RegExp(keyword, 'i') } });
          orConditions.push({ 'item.description': { $regex: new RegExp(keyword, 'i') } });
          orConditions.push({ item: { $regex: new RegExp(keyword, 'i') } });
        }
      });
      
      if (orConditions.length > 0) {
        searchCriteria.$or = orConditions;
      }
      
      console.log('Search criteria for found reports:', JSON.stringify(searchCriteria, null, 2));
      
      matchingReports = await Report.find(searchCriteria).populate('user', 'name email');
    }

    console.log('Found matching reports:', matchingReports ? matchingReports.length : 0);

    if (matchingReports && matchingReports.length > 0) {
      for (const matchReport of matchingReports) {
        console.log('Processing match with report:', matchReport._id);
        
        // Get match item details
        let matchItemName = '';
        if (typeof matchReport.item === 'string') {
          matchItemName = matchReport.item;
        } else if (matchReport.item && typeof matchReport.item === 'object') {
          matchItemName = matchReport.item.name || '';
        }
        
        // Create notification for the user who posted the matching report
        const notification = new Notification({
          user: matchReport.user._id,
          type: 'match',
          title: 'Item Match Found! 🎉',
          message: `Your ${matchReport.type} report for "${matchItemName}" has a potential match! Click to view details and contact the other user.`,
          report: matchReport._id,
          matchedReport: newReport._id
        });
        await notification.save();
        console.log('Created notification for user:', matchReport.user._id);

        // Send real-time notification
        sendNotification(matchReport.user._id.toString(), {
          type: 'match',
          title: 'Item Match Found! 🎉',
          message: `Your ${matchReport.type} report for "${matchItemName}" has a potential match! Click to view details and contact the other user.`,
          notificationId: notification._id,
          matchedReportId: newReport._id,
          matchedUserInfo: {
            name: newReport.user.name,
            email: newReport.user.email,
            contactInfo: newReport.contactInfo
          }
        });

        // Also notify the user who posted the new report
        const newNotification = new Notification({
          user: newReport.user,
          type: 'match',
          title: 'Item Match Found! 🎉',
          message: `Your ${newReport.type} report for "${newItemName}" has a potential match! Click to view details and contact the other user.`,
          report: newReport._id,
          matchedReport: matchReport._id
        });
        await newNotification.save();
        console.log('Created notification for new report user:', newReport.user);

        sendNotification(newReport.user.toString(), {
          type: 'match',
          title: 'Item Match Found! 🎉',
          message: `Your ${newReport.type} report for "${newItemName}" has a potential match! Click to view details and contact the other user.`,
          notificationId: newNotification._id,
          matchedReportId: matchReport._id,
          matchedUserInfo: {
            name: matchReport.user.name,
            email: matchReport.user.email,
            contactInfo: matchReport.contactInfo
          }
        });
      }
    } else {
      console.log('No matching reports found');
    }
  } catch (error) {
    console.error('Error finding matches:', error);
  }
};

// Make the function available to routes
app.locals.findMatchesAndNotify = findMatchesAndNotify;
app.locals.sendNotification = sendNotification;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://192.168.56.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Create admin user if it doesn't exist
  try {
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Administrator',
        email: 'admin@gmail.com',
        password: 'admin123',
        isAdmin: true
      });
      await adminUser.save();
      console.log('✅ Admin user created: admin@gmail.com / admin123');
    } else {
      console.log('✅ Admin user already exists: admin@gmail.com');
    }
  } catch (error) {
    console.log('Admin user creation error:', error.message);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

// Try to start the server
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  }).on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof PORT === 'string'
      ? 'Pipe ' + PORT
      : 'Port ' + PORT;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        // Try alternative port
        const altPort = PORT === 5000 ? 5001 : 5000;
        console.log(`Attempting to start server on port ${altPort}...`);
        process.env.PORT = altPort;
        server.close();
        startServer();
        break;
      default:
        throw error;
    }
  });
};

// Start the server
startServer();
