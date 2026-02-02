const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../utils/emailSender')

// User registration
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({ email, password, name, verificationCode, isVerified: false });
    await user.save();
    await sendVerificationEmail(email, verificationCode);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '4h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    user.isVerified = true;
    user.verificationCode = null; // Clear code after success
    await user.save();

    res.status(200).json({ message: 'Email verified! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};