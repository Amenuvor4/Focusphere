const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passportConfig');

// Load environment variables
dotenv.config(); 

// Check if environment variables are loaded correctly
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'Not Found');
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'Not Found');
// console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Not Found');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware for parsing JSON
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend
  credentials: true, // Allow cookies if needed
}));

// Initialize Passport
app.use(passport.initialize());

// Import routes
const authRoutes = require('./routes/authRoutes'); 
const taskRoutes = require('./routes/taskRoutes'); 

// Use routes
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes); 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
