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
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_PORT == '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"SmartExpense-AI" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log('📧 Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.warn('⚠️ Nodemailer error:', error.message);
      return false;
    }
  }
  console.log(`ℹ️ [Email Simulation] To: ${to} | Subject: ${subject}`);
  return true;
};

module.exports = { sendEmail };
