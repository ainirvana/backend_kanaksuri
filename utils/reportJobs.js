// backend/utils/reportJobs.js
const nodemailer = require('nodemailer');
const Donation = require('../models/Donation');    // or CashDonation, whichever you want
const CashDonation = require('../models/CashDonation');
const ReportRecipient = require('../models/ReportRecipient');
const { Parser } = require('json2csv');  // or any other CSV library
const dayjs = require('dayjs');

const user = process.env.EMAIL_USER;   // e.g. Gmail
const pass = process.env.EMAIL_PASS;   // your app password for Gmail

// Create a nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass
  }
});

// A helper to generate CSV from donations
function generateCsv(donations) {
  const fields = [
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Amount', value: 'amount' },
    { label: 'Note', value: 'note' },
    { label: 'Status', value: 'status' },
    { label: 'CreatedAt', value: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }
  ];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(donations);
  return csv;
}

/**
 * Build a textual summary from a list of donations
 * For example: total count, sum of amounts, etc.
 */
function buildSummaryMessage(donations) {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const count = donations.length;
  return `Total Donations: ${count}\nSum of Amounts: ₹${totalAmount}`;
}

// Helper function to send a single email
async function sendEmail(to, subject, text, attachments = []) {
  return transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    attachments
  });
}

// ============ DAILY =============
exports.sendDailyReport = async () => {
  try {
    // 1) Date range: last 24 hours
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // 2) Fetch data. Example: all new "Donation" or "CashDonation" in last 24 hours
    //    Adjust as needed for your actual logic
    const onlineDonations = await Donation.find({
      createdAt: { $gte: yesterday, $lte: now }
    });
    const cashDonations = await CashDonation.find({
      createdAt: { $gte: yesterday, $lte: now }
    });

    // Combine or keep separate, up to you
    const allDonations = [...onlineDonations, ...cashDonations];

    // 3) Generate summary, CSV, etc.
    const summary = buildSummaryMessage(allDonations);
    const csvData = generateCsv(allDonations);

    // 4) Find recipients with frequency = 'daily'
    const recipients = await ReportRecipient.find({ frequency: 'daily' });

    // 5) For each recipient, send an email with attachments
    for (const r of recipients) {
      const subject = 'Daily Donation Report';
      const body = `Hello ${r.email},\n\nHere is the daily donation report.\n${summary}\n\nRegards,\nYour System`;

      const attachments = [];
      if (r.formats.includes('csv')) {
        attachments.push({
          filename: `DailyDonations-${dayjs().format('YYYYMMDD')}.csv`,
          content: csvData
        });
      }
      // If they want PDF, etc. you'd generate or attach it here

      await sendEmail(r.email, subject, body, attachments);
    }
  } catch (err) {
    console.error('Error sending daily report:', err);
  }
};

// ============ WEEKLY =============
exports.sendWeeklyReport = async () => {
  try {
    // 1) Date range: last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 2) Fetch relevant donations
    const onlineDonations = await Donation.find({
      createdAt: { $gte: sevenDaysAgo, $lte: now }
    });
    const cashDonations = await CashDonation.find({
      createdAt: { $gte: sevenDaysAgo, $lte: now }
    });
    const allDonations = [...onlineDonations, ...cashDonations];

    // 3) Summaries & CSV
    const summary = buildSummaryMessage(allDonations);
    const csvData = generateCsv(allDonations);

    // 4) Recipients with frequency = 'weekly'
    const recipients = await ReportRecipient.find({ frequency: 'weekly' });

    // 5) Send emails
    for (const r of recipients) {
      const subject = 'Weekly Donation Report';
      const body = `Hello ${r.email},\n\nHere is the weekly donation report.\n${summary}\n\nRegards,\nYour System`;

      const attachments = [];
      if (r.formats.includes('csv')) {
        attachments.push({
          filename: `WeeklyDonations-${dayjs().format('YYYYMMDD')}.csv`,
          content: csvData
        });
      }
      // If they want PDF, etc.

      await sendEmail(r.email, subject, body, attachments);
    }
  } catch (err) {
    console.error('Error sending weekly report:', err);
  }
};

// ============ MONTHLY =============
exports.sendMonthlyReport = async () => {
  try {
    // 1) Date range: last 30 days or from the 1st of the month, whichever logic you prefer
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const onlineDonations = await Donation.find({
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });
    const cashDonations = await CashDonation.find({
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });
    const allDonations = [...onlineDonations, ...cashDonations];

    const summary = buildSummaryMessage(allDonations);
    const csvData = generateCsv(allDonations);

    const recipients = await ReportRecipient.find({ frequency: 'monthly' });

    for (const r of recipients) {
      const subject = 'Monthly Donation Report';
      const body = `Hello ${r.email},\n\nHere is the monthly donation report.\n${summary}\n\nRegards,\nYour System`;

      const attachments = [];
      if (r.formats.includes('csv')) {
        attachments.push({
          filename: `MonthlyDonations-${dayjs().format('YYYYMMDD')}.csv`,
          content: csvData
        });
      }

      await sendEmail(r.email, subject, body, attachments);
    }
  } catch (err) {
    console.error('Error sending monthly report:', err);
  }
};
