const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: String(process.env.EMAIL_PORT) === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 10000,
      });

      const info = await transporter.sendMail({
        from: `"SmartExpense-AI" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: text || '',
        html: html || text || '',
      });
      console.log('📧 Password reset email dispatched via SMTP:', info.messageId);
      return true;
    } catch (error) {
      console.warn('⚠️ Nodemailer SMTP send warning:', error.message);
      console.log(`ℹ️ [Email Local Fallback] To: ${to} | Subject: ${subject}`);
      return false;
    }
  }

  console.log(`ℹ️ [Email Simulation Mode - SMTP not configured in .env] To: ${to} | Subject: ${subject}`);
  return true;
};

module.exports = { sendEmail };
