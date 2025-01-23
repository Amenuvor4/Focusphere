const express = require('express');
const jwt = require('jsonwebtoken');
const passport= require('passport')
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const dotenv = require('dotenv');
require('../config/passportConfig');
dotenv.config();

const router = express.Router();

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
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password, loginMethod } = req.body;

  try {
    if (loginMethod === 'email') {
      // Handle traditional email/password login
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
        },
      });
    } else if (loginMethod === 'github' || loginMethod === 'google') {
      // Handle OAuth login (GitHub/Google)
      const provider = loginMethod === 'github' ? 'githubId' : 'googleId';
      const user = await User.findOne({ [provider]: req.body.id });

      if (!user) {
        return res.status(400).json({ message: `No user found for ${loginMethod}` });
      }

      // Create a JWT for the user
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid login method' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// A protected route
router.get('/profile', protect, async (req, res) => {
  try{
    // Access the user's ID from the req.user object
    const user = await User.findById(req.user);
    if(!user) {
      return res.status(404).json({message: "User not found"});
    }

    res.status(200).json({ user});
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Unable to fetch user profile', error: error.message });
  }
});





// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get(
  '/callback/google',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { token, user } = req.user;
    res.status(200).json({ token, user });
  }
);

// GitHub Login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get(
  '/callback/github',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const { token, user } = req.user;
    res.status(200).json({ token, user });
  }
);

module.exports = router;
