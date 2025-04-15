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

// // Import routes
// const userRoutes = require('./routes/userRoutes');
// const donationRoutes = require('./routes/donationRoutes');
// const sponsorRoutes = require('./routes/sponsorRoutes');
// const reportRecipientRoutes = require('./routes/reportRecipientRoutes');
// const inquiryRoutes = require('./routes/inquiryRoutes');
// const dailyDonorImageRoutes = require('./routes/dailyDonorImageRoutes');
// const volunteerRoutes = require('./routes/volunteerRoutes');

// // Start cron jobs
// require('./scheduler');

// const app = express();

// // 1) Basic Middlewares
// app.use(express.json());
// app.use(helmet());
// app.use(morgan('combined'));

// // 2) CORS Configuration (now includes PATCH)
// app.use(cors({
//   origin: [
//     'https://admin.shreekanaksuriahinsadham.com',
//     'https://www.shreekanaksuriahinsadham.com'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   // credentials: true, // Uncomment if you need to allow cookies from cross-site
// }));

// // 3) Disable caching
// app.use((req, res, next) => {
//   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//   res.setHeader('Pragma', 'no-cache');
//   res.setHeader('Expires', '0');
//   next();
// });

// // 4) Serve static files from 'uploads' folder with cross-origin support
// app.use(
//   '/uploads',
//   express.static(path.join(__dirname, 'uploads'), {
//     setHeaders: (res, filePath) => {
//       res.set('Access-Control-Allow-Origin', '*');
//       res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//       res.set('Cross-Origin-Resource-Policy', 'cross-origin');
//     },
//   })
// );

// // 5) Existing routes
// app.use('/api/users', userRoutes);
// app.use('/api/donations', donationRoutes);
// app.use('/api/sponsors', sponsorRoutes);
// app.use('/api/report-recipients', reportRecipientRoutes);
// app.use('/api/inquiries', inquiryRoutes);
// app.use('/api/daily-donor-images', dailyDonorImageRoutes);
// app.use('/api/volunteers', volunteerRoutes);

// // 6) Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // 7) Start the server
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

// Import routes
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const reportRecipientRoutes = require('./routes/reportRecipientRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const dailyDonorImageRoutes = require('./routes/dailyDonorImageRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

// Start cron jobs
require('./scheduler');

const app = express();

// 1) Basic Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));

// 2) CORS Configuration (includes PATCH, etc.)
app.use(cors({
  origin: [
    'https://admin.shreekanaksuriahinsadham.com',
    'https://www.shreekanaksuriahinsadham.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // credentials: true, // Uncomment if you need to allow cookies from cross-site
}));

// *** Global OPTIONS Handler to make sure preflight requests get proper headers ***
app.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// 3) Disable caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 4) Serve static files from 'uploads' folder with cross-origin support
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// 5) Existing routes
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/report-recipients', reportRecipientRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/daily-donor-images', dailyDonorImageRoutes);
app.use('/api/volunteers', volunteerRoutes);

// 6) Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 7) Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

