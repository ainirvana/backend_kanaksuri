// backend/scheduler.js
const cron = require('node-cron');
const { sendDailyReport, sendWeeklyReport, sendMonthlyReport } = require('./utils/reportJobs');

// 1) Daily job: runs every day at 00:00 (midnight server time)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily email job...');
  sendDailyReport();
});

// 2) Weekly job: runs every Sunday at 00:00
cron.schedule('0 0 * * 0', () => {
  console.log('Running weekly email job...');
  sendWeeklyReport();
});

// 3) Monthly job: runs on the 1st day of every month at 00:00
cron.schedule('0 0 1 * *', () => {
  console.log('Running monthly email job...');
  sendMonthlyReport();
});
