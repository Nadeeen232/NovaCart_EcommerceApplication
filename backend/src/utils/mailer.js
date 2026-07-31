import nodemailer from "nodemailer";
export async function sendConfirmation(email, token) {
  const url = `${process.env.CLIENT_URL || "http://localhost:4200"}/confirm-email?token=${token}`;
  if (!process.env.SMTP_HOST) {
    console.log("DEV confirmation URL:", url);
    return url;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Confirm your NovaCart email",
    html: `<h2>Welcome to NovaCart</h2><p>Confirm your email to activate your account.</p><a href="${url}">Confirm email</a>`,
  });
  return null;
}
