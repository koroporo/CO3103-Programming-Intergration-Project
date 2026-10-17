const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(email, resetLink) {
  const { data, error } = await resend.emails.send({
    from: "English Learning Platform <onboarding@resend.dev>",
    to: [email],
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

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
}

module.exports = { sendPasswordResetEmail };
