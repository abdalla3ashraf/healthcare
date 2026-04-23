import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (toEmail, subject, message) => {
  try {
   await transporter.sendMail({
  from: '"Healthcare App" <' + process.env.EMAIL_USER + '>',
  to:   toEmail,
  subject,
  text: message,
});
    console.log(` Email sent to ${toEmail}`);
  } catch (error) {
    console.error(` Email failed: ${error.message}`);
  }
};

export const sendEmergencyEmail = async (toEmail, contactName, patientName) => {
  await sendEmail(
    toEmail,
    ' Emergency Alert',
    `Dear ${contactName},\n\n${patientName} needs immediate help! Their health vitals indicate HIGH RISK.\n\nPlease contact them immediately or call 123.\n\nHealthcare App`
  );
};