const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail(email, resetLink) {
  const info = await transporter.sendMail({
    from: {
      name: "English Learning Platform",
      address: process.env.GMAIL_USER,
    },
    to: email,
    subject: "Reset your password",
    text: [
      "You requested a password reset.",
      "",
      `Open this link to reset your password: ${resetLink}`,
      "",
      "This link expires in 15 minutes.",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <h2>Reset your password</h2>
      <p>You requested a password reset for your account.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  console.log("Password-reset email accepted:", info.messageId);

  return info;
}

module.exports = { sendPasswordResetEmail };
