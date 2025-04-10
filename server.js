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

// // NEW: import the daily donor image routes
// const dailyDonorImageRoutes = require('./routes/dailyDonorImageRoutes');

// // Import the scheduler so cron jobs start
// require('./scheduler');

// const app = express();

// // Middleware
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
//  * Serve static files from the 'uploads' folder, ensuring
//  * cross-origin image loading is allowed (important for Chrome).
//  */
// app.use(
//   '/uploads',
//   express.static(path.join(__dirname, 'uploads'), {
//     setHeaders: (res) => {
//       // Basic CORS header to allow requests from any domain
//       res.set('Access-Control-Allow-Origin', '*');
//       res.set(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept'
//       );
//       // NEW: needed for images to load cross-origin
//       res.set('Cross-Origin-Resource-Policy', 'cross-origin');
//     }
//   })
// );

// /**
//  * Existing routes
//  */
// app.use('/api/users', userRoutes);
// app.use('/api/donations', donationRoutes);
// app.use('/api/sponsors', sponsorRoutes);
// app.use('/api/report-recipients', reportRecipientRoutes);
// app.use('/api/inquiries', inquiryRoutes);

// // NEW: mount daily donor image routes
// app.use('/api/daily-donor-images', dailyDonorImageRoutes);

// /**
//  * Optional: Some folks include another line 
//  * app.use('/uploads', express.static('uploads'))
//  * but the above static middleware already covers it
//  * with the advanced setHeaders config. 
//  * You can remove or keep it if you prefer.
//  */

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
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

app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: [
    'https://admin.shreekanaksuriahinsadham.com',
    'https://www.shreekanaksuriahinsadham.com',
    'http://localhost:3000' // For local dev
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

/**
 * Serve static files from the 'uploads' folder
 */
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      // Chrome requires this for cross-origin images
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
