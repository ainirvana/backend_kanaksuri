// // backend/server.js
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const path = require('path');
// const connectDB = require('./config/db');

// // ENV setup & DB connect
// dotenv.config();
// connectDB();

// // Import existing routes
// const userRoutes = require('./routes/userRoutes');
// const donationRoutes = require('./routes/donationRoutes');
// const sponsorRoutes = require('./routes/sponsorRoutes');
// const reportRecipientRoutes = require('./routes/reportRecipientRoutes');
// const inquiryRoutes = require('./routes/inquiryRoutes');

// // DailyDonorImage routes
// const dailyDonorImageRoutes = require('./routes/dailyDonorImageRoutes');

// // Start your cron jobs
// require('./scheduler');

// const app = express();

// app.use(express.json());
// app.use(helmet());
// app.use(cors({
//   origin: [
//     'https://admin.shreekanaksuriahinsadham.com',
//     'https://www.shreekanaksuriahinsadham.com',
//     'http://localhost:3000' // For local dev
//   ]
// }));
// app.use(morgan('combined'));

// // Disable caching
// app.use((req, res, next) => {
//   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//   res.setHeader('Pragma', 'no-cache');
//   res.setHeader('Expires', '0');
//   next();
// });

// /**
//  * Serve static files from the 'uploads' folder
//  */
// app.use(
//   '/uploads',
//   express.static(path.join(__dirname, 'uploads'), {
//     setHeaders: (res) => {
//       res.set('Access-Control-Allow-Origin', '*');
//       res.set(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept'
//       );
//       // Chrome requires this for cross-origin images
//       res.set('Cross-Origin-Resource-Policy', 'cross-origin');
//     },
//   })
// );

// // Existing routes
// app.use('/api/users', userRoutes);
// app.use('/api/donations', donationRoutes);
// app.use('/api/sponsors', sponsorRoutes);
// app.use('/api/report-recipients', reportRecipientRoutes);
// app.use('/api/inquiries', inquiryRoutes);

// // Daily Donor Images
// app.use('/api/daily-donor-images', dailyDonorImageRoutes);

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// ENV setup & DB connect
dotenv.config();
connectDB();

// Import existing routes
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const reportRecipientRoutes = require('./routes/reportRecipientRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

// DailyDonorImage routes
const dailyDonorImageRoutes = require('./routes/dailyDonorImageRoutes');

// Start your cron jobs
require('./scheduler');

const app = express();

// 1) Basic Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));

/**
 * 2) CORS Configuration
 * Adjust the 'origin' array to match your domains EXACTLY
 */
app.use(cors({
  origin: [
    'https://admin.shreekanaksuriahinsadham.com',
    'https://www.shreekanaksuriahinsadham.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // credentials: true, // Only if you want to allow cookies from cross-site
}));

/**
 * 3) Disable caching
 */
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

/**
 * 4) Serve static files from the 'uploads' folder with cross-origin support
 */
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
      // If you want to allow all domains for images (wildcard):
      // res.set('Access-Control-Allow-Origin', '*');
      // Or to restrict strictly to your admin + main site domains, do:
      // e.g. pick the first domain or wildcard for images
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      // Needed so images from a different origin can be displayed
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// Existing routes
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/report-recipients', reportRecipientRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Daily Donor Images
app.use('/api/daily-donor-images', dailyDonorImageRoutes);

/**
 * 5) Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/**
 * 6) Start the server
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

