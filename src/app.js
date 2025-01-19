const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes'); // Authentication routes
const taskRoutes = require('./routes/taskRoutes'); // Task management routes

// Use routes
app.use('/api/auth', authRoutes); // Mount authentication routes
app.use('/api/tasks', taskRoutes); // Mount task management routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
