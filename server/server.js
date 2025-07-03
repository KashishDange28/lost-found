require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const User = require('./models/User');

const app = express();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Create initial admin user if not exists
    User.findOne({ email: 'admin@kkwagh.edu.in' })
      .then(user => {
        if (!user) {
          const admin = new User({
            name: 'Admin',
            email: 'admin@kkwagh.edu.in',
            password: 'admin123'
          });
          return admin.save();
        }
        return user;
      })
      .catch(err => console.error('Error creating admin user:', err));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

// Try to start the server
const startServer = () => {
  const server = app.listen(PORT, () => {
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
