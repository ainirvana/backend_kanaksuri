// backend/utils/reportJobs.js
const nodemailer = require('nodemailer');
const Donation = require('../models/Donation');
const CashDonation = require('../models/CashDonation');
const ReportRecipient = require('../models/ReportRecipient');
const User = require('../models/User');
const { Parser } = require('json2csv');
const dayjs = require('dayjs');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// ---------------------------------------------
// CSV Field Definitions
// ---------------------------------------------
// Trustee CSV (for admin/trustee reports)
const trusteeFields = [
  { label: 'Donation Type', value: row => row.donationType ? row.donationType.toUpperCase() : 'ONLINE' },
  { label: 'Receipt Number', value: 'receiptNumber' },
  { label: 'Name', value: 'name' },
  { label: 'Whatsapp', value: row => row.whatsapp || '' },
  { label: 'Phone', value: row => row.phone || '' },
  { label: 'Email', value: 'email' },
  { label: 'Amount', value: 'amount' },
  { label: 'Note', value: 'note' },
  { label: 'Status', value: 'status' },
  { label: 'Created At', value: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' },
  { label: 'Bank Name', value: row => row.bankName || '' },
  { label: 'Cheque Number', value: row => row.chequeNumber || '' },
  { label: 'UPI Transaction ID', value: row => row.upiTransactionId || '' },
  { label: 'Aadhar Card', value: row => row.aadharCard || '' },
  { label: 'PAN Card', value: row => row.panCard || '' },
  { label: 'Deposit Acknowledged', value: row => row.depositAcknowledged ? 'Yes' : 'No' },
  { label: 'Deposit Note', value: row => row.depositNote || '' },
  { label: 'Deposit Verified', value: row => row.depositVerified ? 'Yes' : 'No' },
  { label: 'Deposit Verified At', value: row => row.depositVerifiedAt ? new Date(row.depositVerifiedAt).toLocaleString() : '' },
  { label: 'Volunteer', value: row => (row.volunteer && row.volunteer.username) ? row.volunteer.username : '' },
  { label: 'Order ID', value: row => row.order_id || '' },
  { label: 'Payment ID', value: row => row.payment_id || '' },
  { label: 'Razorpay Signature', value: row => row.razorpay_signature || '' }
];

// Volunteer CSV (for individual volunteer reports)
const volunteerFields = [
  { label: 'Receipt Number', value: 'receiptNumber' },
  { label: 'Name', value: 'name' },
  { label: 'Amount', value: 'amount' },
  { label: 'Note', value: 'note' },
  { label: 'Status', value: 'status' },
  { label: 'Created At', value: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' },
  { label: 'Donation Type', value: row => row.donationType ? row.donationType.toUpperCase() : '' },
  { label: 'Bank Name', value: row => row.bankName || '' },
  { label: 'Cheque Number', value: row => row.chequeNumber || '' },
  { label: 'UPI Transaction ID', value: row => row.upiTransactionId || '' },
  { label: 'Aadhar Card', value: row => row.aadharCard || '' },
  { label: 'PAN Card', value: row => row.panCard || '' },
  { label: 'Deposit Acknowledged', value: row => row.depositAcknowledged ? 'Yes' : 'No' },
  { label: 'Deposit Note', value: row => row.depositNote || '' },
  { label: 'Deposit Verified', value: row => row.depositVerified ? 'Yes' : 'No' },
  { label: 'Deposit Verified At', value: row => row.depositVerifiedAt ? new Date(row.depositVerifiedAt).toLocaleString() : '' }
];

// CSV generation functions
function generateTrusteeCsv(donations) {
  const json2csvParser = new Parser({ fields: trusteeFields });
  return json2csvParser.parse(donations);
}

function generateVolunteerCsv(donations) {
  const json2csvParser = new Parser({ fields: volunteerFields });
  return json2csvParser.parse(donations);
}

// ---------------------------------------------
// Helper: Build summary message from donation data
// ---------------------------------------------
function buildSummaryMessage(donations) {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const count = donations.length;
  return `Total Donations: ${count}\nSum of Amounts: ₹${totalAmount}`;
}

// ---------------------------------------------
// Helper: Send email
// ---------------------------------------------
async function sendEmail(to, subject, text, attachments = []) {
  return transporter.sendMail({
    from: emailUser,
    to,
    subject,
    text,
    attachments
  });
}

// ---------------------------------------------
// ADMIN REPORT JOBS
// ---------------------------------------------

// Daily Report for Admin/Trustees
exports.sendDailyReport = async () => {
  try {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const onlineDonations = await Donation.find({
      createdAt: { $gte: yesterday, $lte: now },
      isDeleted: false
    });
    const cashDonations = await CashDonation.find({
      createdAt: { $gte: yesterday, $lte: now },
      isDeleted: false
    });
    const allDonations = [...onlineDonations, ...cashDonations];
    const summary = buildSummaryMessage(allDonations);
    const csvData = generateTrusteeCsv(allDonations);

    const recipients = await ReportRecipient.find({ frequency: 'daily' });
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
      await sendEmail(r.email, subject, body, attachments);
    }
  } catch (err) {
    console.error('Error sending daily report:', err);
  }
};

// Weekly Report for Admin/Trustees
exports.sendWeeklyReport = async () => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const onlineDonations = await Donation.find({
      createdAt: { $gte: sevenDaysAgo, $lte: now },
      isDeleted: false
    });
    const cashDonations = await CashDonation.find({
      createdAt: { $gte: sevenDaysAgo, $lte: now },
      isDeleted: false
    });
    const allDonations = [...onlineDonations, ...cashDonations];
    const summary = buildSummaryMessage(allDonations);
    const csvData = generateTrusteeCsv(allDonations);

    const recipients = await ReportRecipient.find({ frequency: 'weekly' });
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
      await sendEmail(r.email, subject, body, attachments);
    }
  } catch (err) {
    console.error('Error sending weekly report:', err);
  }
};

// Monthly Report for Admin/Trustees
exports.sendMonthlyReport = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const onlineDonations = await Donation.find({
      createdAt: { $gte: thirtyDaysAgo, $lte: now },
      isDeleted: false
    });
    const cashDonations = await CashDonation.find({
      createdAt: { $gte: thirtyDaysAgo, $lte: now },
      isDeleted: false
    });
    const allDonations = [...onlineDonations, ...cashDonations];
    const summary = buildSummaryMessage(allDonations);
    const csvData = generateTrusteeCsv(allDonations);

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

// ---------------------------------------------
// VOLUNTEER DAILY CSV (sent individually to each volunteer)
// ---------------------------------------------
exports.sendVolunteerDailyCSVs = async () => {
  try {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const volunteers = await User.find({ role: 'volunteer' });
    if (!volunteers.length) return;

    for (const vol of volunteers) {
      if (!vol.email) continue;

      const volunteerDonations = await CashDonation.find({
        volunteer: vol._id,
        createdAt: { $gte: yesterday, $lte: now },
        isDeleted: false
      });

      if (!volunteerDonations.length) continue;

      const csvData = generateVolunteerCsv(volunteerDonations);
      const summary = buildSummaryMessage(volunteerDonations);
      const subject = 'Your Daily Donation Report';
      const body = `Hello ${vol.username},\n\nHere is your daily donation report.\n${summary}\n\nRegards,\nYour System`;
      const attachments = [
        {
          filename: `Volunteer_${vol.username}_Daily_${dayjs().format('YYYYMMDD')}.csv`,
          content: csvData
        }
      ];
      await sendEmail(vol.email, subject, body, attachments);
    }
  } catch (err) {
    console.error('Error sending volunteer daily CSVs:', err);
  }
};
