const nodemailer = require('nodemailer');

let transporter = null;
let transportReady = false;

function getTransport() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] SMTP env vars not configured. Emails will be skipped. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(SMTP_SECURE).toLowerCase() === 'true' || Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  transporter.verify().then(() => {
    transportReady = true;
    console.log('[mailer] SMTP transport verified and ready');
  }).catch((err) => {
    console.warn('[mailer] SMTP verify failed:', err.message);
  });

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransport();
  if (!t) return { skipped: true };
  const from = process.env.SMTP_FROM || `Sholok <${process.env.SMTP_USER}>`;
  try {
    const info = await t.sendMail({ from, to, subject, html, text });
    console.log(`[mailer] sent to ${to}: ${info.messageId}`);
    return { sent: true, info };
  } catch (err) {
    console.error('[mailer] send failed:', err.message);
    return { error: err.message };
  }
}

function renderOrderConfirmationHtml({ customerName, order }) {
  const addr = order.shippingAddress || {};
  const addrLine = [addr.name, addr.street, addr.city, addr.state, addr.zipCode, addr.country]
    .filter(Boolean).join(', ');
  const itemsRows = (order.items || []).map((it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.productName || it.name || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">৳${Number(it.price || 0).toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">৳${Number((it.total != null ? it.total : it.price * it.quantity) || 0).toFixed(2)}</td>
    </tr>`).join('');

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#222">
    <h2 style="color:#E31E24;margin-bottom:4px">Order Confirmed</h2>
    <p>Hi ${customerName || 'Customer'},</p>
    <p>Thank you for your order at <strong>Sholok</strong>. Your order has been received and is being processed.</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}<br/>
       <strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}<br/>
       <strong>Payment:</strong> ${order.paymentMethod}</p>

    <h3 style="border-bottom:2px solid #E31E24;padding-bottom:4px">Items</h3>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#f7f7f7">
        <th style="padding:8px;text-align:left">Item</th>
        <th style="padding:8px;text-align:center">Qty</th>
        <th style="padding:8px;text-align:right">Price</th>
        <th style="padding:8px;text-align:right">Subtotal</th>
      </tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <table style="width:100%;margin-top:12px">
      <tr><td style="text-align:right;padding:4px">Subtotal:</td><td style="text-align:right;padding:4px;width:120px">৳${Number(order.subtotal || 0).toFixed(2)}</td></tr>
      <tr><td style="text-align:right;padding:4px">Delivery:</td><td style="text-align:right;padding:4px">৳${Number(order.shipping || 0).toFixed(2)}</td></tr>
      <tr><td style="text-align:right;padding:4px;font-weight:bold;font-size:16px">Total:</td><td style="text-align:right;padding:4px;font-weight:bold;font-size:16px;color:#E31E24">৳${Number(order.total || 0).toFixed(2)}</td></tr>
    </table>

    <h3 style="border-bottom:2px solid #E31E24;padding-bottom:4px;margin-top:24px">Shipping Address</h3>
    <p>${addrLine || 'N/A'}<br/>${addr.phone ? 'Phone: ' + addr.phone : ''}</p>

    <p style="margin-top:24px;color:#666;font-size:13px">If you have any questions, simply reply to this email.</p>
    <p style="color:#888;font-size:12px">— The Sholok Team</p>
  </div>`;
}

module.exports = { sendMail, renderOrderConfirmationHtml };
