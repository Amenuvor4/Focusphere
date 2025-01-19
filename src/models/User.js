const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
