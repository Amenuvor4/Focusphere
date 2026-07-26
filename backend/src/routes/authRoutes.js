const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {protect, loginLimiter, registerLimiter, refreshLimiter, sendVerificationLimiter} = require('../middleware/authMiddleware');
const User = require('../models/User');
const dotenv = require('dotenv');
const { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailSender');
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
    userId: user._id.toString(), 
    email: user.email,
    name: user.name,
    role: user.role,
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
    isEmailVerified: user.isEmailVerified || false,
    hasGoogleCalendar: !!user.googleRefreshToken,
  };
};

// Register route
router.post('/register', registerLimiter, async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name, isEmailVerified: false });

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    console.log(`[Email Verification] Sending code ${code} to ${email}`);
    try {
      await sendVerificationEmail(email, code);
      console.log(`[Email Verification] Successfully sent to ${email}`);
    } catch (emailError) {
      console.error(`[Email Verification] FAILED to send to ${email}:`, emailError.message);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      accessToken,
      refreshToken,
      user: formatUserResponse(user),
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Token refresh route
router.post('/refresh-token', refreshLimiter, async (req, res) => {
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
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Login route
router.post('/login', loginLimiter, async (req, res) => {
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
      user: formatUserResponse(user),
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
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Unable to fetch user profile', error: error.message });
  }
});

//Get all users (Admin route)
router.get('/users', protect, async (req, res) => {
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({message: 'Access denied. Admins only.'});
    }
    const users = await User.find({}).select('-password -verificationCode -verificationCodeExpires -googleAccessToken -googleRefreshToken').sort({createdAt: -1});

    res.status(200).json(users)
  } catch (error){
    console.error('Failed to fetch user:', error)
    res.status(500).json({message: 'Unable to fetch users from db', error: error.message});
  }
})

// OAuth Callback Handler - IMPROVED with environment variable
const handleOAuthCallback = (req, res) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Use environment variable for client URL (defaults to localhost:3000)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    // Redirect with tokens as query parameters
    res.redirect(`${clientUrl}/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth?error=authentication_failed`);
  }
};

// Google Login - Request offline access for calendar sync
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
  accessType: 'offline',
  prompt: 'consent'
}));

// Google Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=google_failed' }),
  handleOAuthCallback
);

// Send verification code
router.post('/send-verification', protect, sendVerificationLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[Email Verification] Resending code ${code} to ${user.email}`);
    await sendVerificationEmail(user.email, code);
    console.log(`[Email Verification] Successfully sent to ${user.email}`);

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: 'Failed to send verification email', error: error.message });
  }
});

// Verify email code
router.post('/verify-email', protect, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if code matches and hasn't expired
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({ message: 'Email verified successfully', isEmailVerified: true });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Failed to verify email', error: error.message });
  }
});

// GitHub Login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/auth?error=github_failed' }),
  handleOAuthCallback
);

module.exports = router;