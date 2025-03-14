const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
  'JWT_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Helper function to find or create a user
const findOrCreateUser = async (email, name, providerData = {}) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      email,
      name,
      ...providerData,
    });
    await user.save();
  }
  return user;
};

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: 'Google account does not provide an email.' });
        }

        const user = await findOrCreateUser(email, profile.displayName);
        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' });

        done(null, { user, token });
      } catch (error) {
        console.error('Google strategy error:', error);
        done(error, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails?.find((e) => e.verified)?.value || profile.emails?.[0]?.value;
        if (!email) {
          console.error('GitHub profile does not provide a verified email:', profile);
          return done(null, false, { message: 'GitHub account does not provide a verified email.' });
        }

        const user = await findOrCreateUser(email, profile.displayName || profile.username, {
          githubId: profile.id,
        });
        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' });

        done(null, { user, token });
      } catch (error) {
        console.error('GitHub strategy error:', error);
        done(error, null);
      }
    }
  )
);

// Serialize user (store only user ID)
passport.serializeUser((data, done) => {
  done(null, data.user._id.toString());
});

// Deserialize user (fetch full user from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
