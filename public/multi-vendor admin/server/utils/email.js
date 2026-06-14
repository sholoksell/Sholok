const nodemailer = require("nodemailer");

/**
 * Email service — uses SMTP credentials from .env.
 * Falls back to console logging in development if SMTP not configured.
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST === "smtp.gmail.com" && process.env.EMAIL_USER === "your_email@gmail.com") {
    return null; // Not configured
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`\n📧 [DEV] Email to ${to} → ${subject}\n${text || html}\n`);
    return { dev: true };
  }
  return t.sendMail({
    from: process.env.EMAIL_FROM || "noreply@sholok.store",
    to, subject, html, text,
  });
}

const baseTemplate = (title, body) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f5f5fa;margin:0;padding:30px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#6c47ff,#a855f7);padding:30px;color:#fff;">
      <h1 style="margin:0;font-size:22px;">🛍️ Sholok eCommerce</h1>
      <p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${title}</p>
    </div>
    <div style="padding:30px;color:#1f2937;line-height:1.6;font-size:14px;">${body}</div>
    <div style="padding:20px 30px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
      © ${new Date().getFullYear()} Sholok eCommerce · Bangladesh's smart marketplace
    </div>
  </div>
</body></html>`;

const templates = {
  verifyEmail: (name, link) => baseTemplate("Verify your email", `
    <p>Hi ${name},</p>
    <p>Welcome to Sholok! Please verify your email to activate your account:</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${link}" style="background:#6c47ff;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;">Verify Email</a>
    </p>
    <p style="font-size:12px;color:#6b7280;">Or copy this link: ${link}</p>
    <p style="font-size:12px;color:#6b7280;">This link expires in 24 hours.</p>
  `),
  resetPassword: (name, link) => baseTemplate("Reset your password", `
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click below to set a new password:</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${link}" style="background:#6c47ff;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;">Reset Password</a>
    </p>
    <p style="font-size:12px;color:#6b7280;">If you didn't request this, ignore this email. Link expires in 30 minutes.</p>
  `),
  orderConfirmation: (name, orderNumber, total) => baseTemplate("Order confirmed!", `
    <p>Hi ${name},</p>
    <p>Your order <strong>#${orderNumber}</strong> has been confirmed.</p>
    <p>Total: <strong>৳${total.toLocaleString()}</strong></p>
    <p>We'll notify you when it ships.</p>
  `),
};

module.exports = { sendEmail, templates };
