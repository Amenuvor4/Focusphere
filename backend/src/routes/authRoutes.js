const express = require('express');
const jwt = require('jsonwebtoken');
const passport= require('passport')
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const dotenv = require('dotenv');
require('../config/passportConfig');
dotenv.config();

const router = express.Router();


// Helper functions
const generateToken = (user) => {
  return jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h'});
};

const formatUserResponse = (user) => {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    preferences: user.preferences,
  };
};

// Register route
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user signed up with Google (no password stored)
    if (!user.password) {
      return res.status(400).json({ message: 'Please log in with Google' });
    }

    // Regular login flow for users with passwords
    if (!(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({ token, user: formatUserResponse(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

      


// Protected route
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: formatUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch user profile', error: error.message });
  }
});

// OAuth Callback Handler
const handleOAuthCallback = (req, res) => {
  const { token, user } = req.user;
  res.redirect(`http://localhost:3000/dashboard?token=${token}`);
};

// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get(
  '/callback/google',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
);

// GitHub Login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get(
  '/callback/github',
  passport.authenticate('github', { session: false }),
  handleOAuthCallback
);

module.exports = router;