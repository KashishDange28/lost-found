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
const usersRoutes = require('./routes/users');
const User = require('./models/User');
const Report = require('./models/Report');
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);
// Compute allowed origins from environment for CORS and Socket.IO
const rawOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
const parsedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
const devLocalOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://192.168.56.1:3000'];
const allowedOrigins = process.env.NODE_ENV === 'production' ? parsedOrigins : Array.from(new Set([...parsedOrigins, ...devLocalOrigins]));

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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


// --- THIS IS THE FIXED MATCHING FUNCTION ---
const findMatchesAndNotify = async (newReport) => {
  try {
    console.log('Finding matches for new report:', newReport._id);
    
    // Populate the user of the new report to get their name/email
    await newReport.populate('user', 'name email');
    
    let matchingReports;
    
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
    
    // --- UPDATED KEYWORD LOGIC ---
    // Combine name and description, split into words, get unique words, and filter out empty strings.
    const combinedText = (newItemName.toLowerCase() + ' ' + newItemDescription.toLowerCase());
    const keywords = combinedText.split(/\s+/); // Split by one or more spaces
    const uniqueKeywords = [...new Set(keywords)].filter(k => k.length > 0); // Allow short words!
    // -----------------------------
    
    console.log('Search keywords:', uniqueKeywords);
    
    let searchCriteria = {
      type: newReport.type === 'lost' ? 'found' : 'lost', // Find the opposite type
      status: 'active',
      _id: { $ne: newReport._id }
    };

    // If we have no keywords, we can't match
    if (uniqueKeywords.length === 0) {
      console.log('No keywords to search with. Aborting match find.');
      return;
    }

    // Create an OR condition for matching
    // This will find reports where ANY of the keywords match the name or description
    const orConditions = [];
    uniqueKeywords.forEach(keyword => {
      // Create a regex for the keyword
      const regex = new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'); // Escape special chars
      orConditions.push({ 'item.name': { $regex: regex } });
      orConditions.push({ 'item.description': { $regex: regex } });
      orConditions.push({ item: { $regex: regex } }); // For old string-based items
    });
    
    // Remove duplicate conditions
    const uniqueOrConditions = [...new Map(orConditions.map(item => [JSON.stringify(item), item])).values()];
    searchCriteria.$or = uniqueOrConditions;
      
    console.log(`Search criteria for ${searchCriteria.type} reports:`, JSON.stringify(searchCriteria, null, 2));
    
    matchingReports = await Report.find(searchCriteria).populate('user', 'name email');

    console.log('Found matching reports:', matchingReports ? matchingReports.length : 0);

    if (matchingReports && matchingReports.length > 0) {
      for (const matchReport of matchingReports) {
        console.log('Processing match with report:', matchReport._id);
        
        let matchItemName = '';
        if (typeof matchReport.item === 'string') {
          matchItemName = matchReport.item;
        } else if (matchReport.item && typeof matchReport.item === 'object') {
          matchItemName = matchReport.item.name || '';
        }

        // --- Safety check for deleted users ---
        if (!matchReport.user || !newReport.user) {
          console.log(`Skipping match, user not found. newReport.user: ${!!newReport.user}, matchReport.user: ${!!matchReport.user}`);
          continue; 
        }
        
        // --- THIS IS THE IMMEDIATE NOTIFICATION YOU WANTED ---
        
        // 1. Create notification for the user who posted the *matching* report
        const notification = new Notification({
          user: matchReport.user._id,
          type: 'match',
          title: 'Potential Match Found! 💡',
          message: `Your ${matchReport.type} report for "${matchItemName}" has a new potential match!`,
          report: matchReport._id,
          matchedReport: newReport._id
        });
        await notification.save();
        console.log('Created notification for user:', matchReport.user._id);

        // 2. Send real-time notification to that user
        sendNotification(matchReport.user._id.toString(), {
          type: 'match',
          title: 'Potential Match Found! 💡',
          message: `Your ${matchReport.type} report for "${matchItemName}" has a new potential match! An admin will review it.`,
          notificationId: notification._id,
          matchedReportId: newReport._id,
          matchedUserInfo: {
            name: newReport.user.name,
            email: newReport.user.email,
            contactInfo: newReport.contactInfo
          }
        });

        // 3. Create notification for the user who posted the *new* report
        const newNotification = new Notification({
          user: newReport.user._id, // Use _id from populated user
          type: 'match',
          title: 'Potential Match Found! 💡',
          message: `Your ${newReport.type} report for "${newItemName}" has a new potential match!`,
          report: newReport._id,
          matchedReport: matchReport._id
        });
        await newNotification.save();
        console.log('Created notification for new report user:', newReport.user._id);

        // 4. Send real-time notification to the new report user
        sendNotification(newReport.user._id.toString(), {
          type: 'match',
          title: 'Potential Match Found! 💡',
          message: `Your ${newReport.type} report for "${newItemName}" has a new potential match! An admin will review it.`,
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
    console.error('Error in findMatchesAndNotify:', error);
  }
};
// --- END OF FIXED FUNCTION ---


// Make the function available to routes
app.locals.findMatchesAndNotify = findMatchesAndNotify;
app.locals.sendNotification = sendNotification;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
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
  // Admin check removed as requested
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// --- CLEANED UP ROUTES ---
// Serve static files from 'uploads' folder
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes); 
// -------------------------

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  // Defensive error handler: guard against undefined `err`
  if (!err) {
    console.error('Global error handler called without an error object');
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  // Safely log error details
  try {
    console.error('Global error handler:', err.stack || err);
  } catch (logErr) {
    console.error('Error while logging error:', logErr, 'original error:', err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack || String(err) })
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
        const altPort = PORT + 1; // Try next port
        console.log(`Attempting to start server on port ${altPort}...`);
        
        setTimeout(() => {
          server.listen(altPort, () => {
            console.log(`Server is running on port ${altPort}`);
          }).on('error', (err) => {
            console.error(`Failed to start on port ${altPort} as well.`, err);
            process.exit(1);
          });
        }, 1000);
        break;
      default:
        throw error;
    }
  });
};

// Start the server
startServer();