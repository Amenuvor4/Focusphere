const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Override with .env.local if it exists 
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passportConfig');

const app = express();




console.log("Server time:", new Date().toISOString());


app.use(express.json());


app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://focusphere-indol.vercel.app", "https://focusphere.onrender.com"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true, 
}));


app.use(passport.initialize());


const authRoutes = require('./routes/authRoutes'); 
const taskRoutes = require('./routes/taskRoutes'); 
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes'); 

app.use('/ai', aiRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/goals', goalRoutes);



const clientBuildPath = path.resolve(__dirname, 'client', 'build');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  console.warn("client/build folder not found. Skipping static file serving.");
}

app.set('trust proxy', 1);

module.exports = app;