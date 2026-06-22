import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to self for testing
  subject: 'Qalbify Email Test',
  text: 'This is a test email from Qalbify backend to verify SMTP configuration.',
};

console.log('Attempting to send test email...');
console.log('User:', process.env.EMAIL_USER);

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error occurred:', error.message);
    return process.exit(1);
  }
  console.log('Email sent successfully!');
  console.log('Message ID:', info.messageId);
  process.exit(0);
});
