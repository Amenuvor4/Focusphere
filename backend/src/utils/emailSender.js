const nodemailer = require('nodemailer');

// Create transporter - configure based on your email provider
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });
};

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification email with OTP code
 */
const sendVerificationEmail = async (email, code) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Focusphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Focusphere Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to Focusphere!</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send welcome email after verification
 */
const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Focusphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Focusphere - Email Verified!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Email Verified Successfully!</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your email has been verified. You now have full access to Focusphere features including:</p>
        <ul>
          <li>Google Calendar sync</li>
          <li>AI-powered task management</li>
          <li>Smart scheduling</li>
        </ul>
        <p>Start organizing your tasks and achieving your goals!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendWelcomeEmail,
};
