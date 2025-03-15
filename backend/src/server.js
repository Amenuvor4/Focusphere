const dotenv = require('dotenv');
dotenv.config(); // Load environment variables at the very top

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const connectDB = require('./config/db');
require('./config/passportConfig'); // Ensure passport strategies are loaded

const app = express();

// Connect to MongoDB
connectDB();

console.log("Server time:", new Date().toISOString());

// Middleware for parsing JSON
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allow more HTTP methods
  credentials: true, // Allow cookies if needed
}));

// Initialize Passport
app.use(passport.initialize());

// Import routes
const authRoutes = require('./routes/authRoutes'); 
const taskRoutes = require('./routes/taskRoutes'); 
const goalRoutes = require('./routes/goalRoutes');

// Use routes
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/goals', goalRoutes);

// Serve static files in production
const clientBuildPath = path.resolve(__dirname, 'client', 'build');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  console.warn("⚠️  client/build folder not found. Skipping static file serving.");
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
