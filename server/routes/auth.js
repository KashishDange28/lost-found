const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

// Configure Google OAuth to accept all email domains
const ALLOW_ALL_EMAILS = true;

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate email format
    // (No restriction on email domain)

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error); // Pass to error handler middleware
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error); // Pass to error handler middleware
  }
});

// Google OAuth setup - Using Google OAuth2Client directly
// All Google OAuth is now handled by the /google-login endpoint

// Google login endpoint for frontend
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'No credential provided' 
      });
    }

    console.log('Google login attempt with credential length:', credential.length);

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    console.log('Google payload received:', {
      email: payload.email,
      name: payload.name,
      email_verified: payload.email_verified
    });
    
    if (!payload.email_verified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Google email not verified' 
      });
    }
    
    // Log the user's email for debugging
    console.log('Google login attempt from email:', payload.email);
    
    // Allow all email domains
    if (!ALLOW_ALL_EMAILS) {
      const allowedDomains = ['kkwagh.edu.in'];
      const emailDomain = payload.email.split('@')[1];
      
      if (!allowedDomains.includes(emailDomain)) {
        return res.status(403).json({
          success: false,
          message: 'Only specific email domains are allowed'
        });
      }
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      console.log('Creating new user for email:', payload.email);
      user = new User({
        name: payload.name || 'User',
        email: payload.email,
        // Generate a random password for the user
        password: require('crypto').randomBytes(16).toString('hex')
      });
      await user.save();
      console.log('New user created with ID:', user._id);
    } else {
      console.log('Existing user found with ID:', user._id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user data for response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    console.log('Sending user response:', {
      success: true,
      userId: userResponse._id,
      name: userResponse.name,
      email: userResponse.email
    });
    
    res.json({ 
      success: true, 
      token, 
      user: userResponse 
    });
    
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ 
      success: false, 
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin login endpoint
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    console.log('Admin login attempt:', email);

    // Find admin user
    const admin = await User.findOne({ email, isAdmin: true });
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare admin data for response
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    console.log('Admin login successful:', admin.email);
    
    res.json({ 
      success: true, 
      token, 
      user: adminResponse 
    });
    
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Admin authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
