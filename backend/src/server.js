const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const connectDB = require('./config/db');
require('./config/passportConfig');

const app = express();


connectDB();

console.log("Server time:", new Date().toISOString());


app.use(express.json());


app.use(cors({
  origin: ["http://localhost:3000"," https://focusphere-indol.vercel.app/" ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true, 
}));


app.use(passport.initialize());


const authRoutes = require('./routes/authRoutes'); 
const taskRoutes = require('./routes/taskRoutes'); 
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes'); 

app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/goals', goalRoutes);



const clientBuildPath = path.resolve(__dirname, 'client', 'build');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  console.warn("client/build folder not found. Skipping static file serving.");
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
