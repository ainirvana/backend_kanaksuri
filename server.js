// // backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// Import routes
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const reportRecipientRoutes = require('./routes/reportRecipientRoutes');

// Import the scheduler so cron jobs start
require('./scheduler');

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: [
    'https://shreekanaksuriahinsadham.aivialabs.com',
    'https://shreekanaksuriDashboard.aivialabs.com',
    'https://shreekanaksuriahinsadham.com',
    'https://admin.shreekanaksuriahinsadham.com',
    'https://www.shreekanaksuriahinsadham.com/',
    'http://localhost:3000'
  ]
}));
app.use(morgan('combined'));

// Disable caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/report-recipients', reportRecipientRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
