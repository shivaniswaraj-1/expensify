const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  // Creates a free test account automatically every time
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Expensify" <noreply@expensify.com>',
    to,
    subject,
    html,
  });

  // This prints the preview URL in your Vercel logs
  console.log("📧 Email preview URL: " + nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;