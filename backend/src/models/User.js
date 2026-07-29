const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true,
    validate: {
      validator: validator.isEmail,
      message: props => `${props.value} is not a valid email address!`,
    },
   },
  password: { type: String, minlength: 8,  },
  name: { type: String },
  githubId: {type: String},
  googleRefreshToken: { type: String },
  googleAccessToken: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) return next(); // Only hash if password is modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });


  // Method to compare hashed passwords
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};


userSchema.statics.findOrCreate = async function (criteria, userData) {
  let user = await this.findOne(criteria);
  if (!user) {
    user = await this.create(userData);
  }
  return user;
};

userSchema.index({ githubId: 1 });


const User = mongoose.model('User', userSchema);
module.exports = User;
