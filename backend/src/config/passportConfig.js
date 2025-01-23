const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value;
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            email,
            name: profile.displayName,
          });
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        done(null, { user, token });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,// this is random
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],

      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Safely access email or fallback to a GitHub-based pseudo-email
          const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
  
          if (!email) {
            console.error('GitHub profile does not provide an email:', profile);
            return done(null, false, { message: 'GitHub account does not provide an email.' });
          }
  
          // Check if a user with this email exists in the database
          let user = await User.findOne({ email });
          if (!user) {
            // If no user exists, create one
            user = new User({
              email,
              name: profile.displayName || profile.username || 'No Name',
              githubId: profile.id, // Optional: Save GitHub ID if needed
            });
            await user.save();
          }
  
          // Generate a JWT token for the user
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
          done(null, { user, token });
        } catch (error) {
          console.error('GitHub strategy error:', error);
          done(error, null);
        }
      }
    )
  );

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));
