// backend/scheduler.js
const cron = require('node-cron');
const {
  sendDailyReport,
  sendWeeklyReport,
  sendMonthlyReport,
  sendVolunteerDailyCSVs
} = require('./utils/reportJobs');

// Daily job for admin/trustee recipients: runs every day at 00:00 (server time)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily email job for admin/trustee...');
  sendDailyReport();
});

// Weekly job for admin/trustee recipients: runs every Sunday at 00:00 (server time)
cron.schedule('0 0 * * 0', () => {
  console.log('Running weekly email job for admin/trustee...');
  sendWeeklyReport();
});

// Monthly job for admin/trustee recipients: runs on the 1st day of every month at 00:00 (server time)
cron.schedule('0 0 1 * *', () => {
  console.log('Running monthly email job for admin/trustee...');
  sendMonthlyReport();
});

// Volunteer daily CSV job: runs every day at 23:59 (server time)
cron.schedule('59 23 * * *', () => {
  console.log('Running daily CSV job for volunteers...');
  sendVolunteerDailyCSVs();
});
