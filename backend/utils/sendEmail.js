const nodemailer = require("nodemailer");

// Fail loudly at boot if the required env vars are missing, instead of
// silently falling back to a fake test account that never reaches real users.
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error(
    "❌ EMAIL_USER / EMAIL_PASS are not set. Password reset emails will fail. " +
      "Set them in your .env locally and in your Vercel Project → Settings → Environment Variables."
  );
}

// Reuse a single transporter instead of creating a new one on every request.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your normal Gmail password)
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("SMTP Server is ready.");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Expensify" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    // Re-throw so the caller (resetPassword controller) knows the send failed
    // and doesn't tell the user "Email sent!" when it wasn't.
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;