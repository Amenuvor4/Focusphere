const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const dotenv = require('dotenv');
require('../config/passportConfig');
dotenv.config();

const router = express.Router();

const generateTokens = (userData) => {
  const user = userData.user || userData;
  if (!user || !user._id) {
    console.error("Error in generateTokens: user or user._id is undefined", user);
    throw new Error("Invalid user data in generateTokens");
  }

  const payload = {
    userId: user._id.toString(), // Convert ObjectId to string
    email: user.email,
    name: user.name
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};


const formatUserResponse = (user) => {
  return {
    id: user.id,
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

// Token refresh route
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    res.status(401).json({ error: 'Invalid refresh token' });
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

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected route
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
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
  const user = req.user;
  const { accessToken, refreshToken } = generateTokens(user);
    
  // Pass tokens as query parameters - fixed to use accessToken and refreshToken
  res.redirect(`http://localhost:3000/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
};

// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get(
  '/callback/google',
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=google_failed' }),
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