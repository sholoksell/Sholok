const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/orders/invoice/:orderNumber  — printable HTML invoice (public by order number)
router.get('/:orderNumber', async (req, res) => {
  try {
    const [[order]] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number = ? LIMIT 1`,
      [req.params.orderNumber]
    );
    if (!order) return res.status(404).send('<h2>Order not found</h2>');

    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?', [order.id]
    );

    const fmt = n => '৳' + Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 0 });
    const subtotal       = Number(order.subtotal || 0);
    const deliveryCharge = Number(order.delivery_charge || order.shipping || 0);
    const discount       = Number(order.discount || 0);
    const total          = Number(order.total || 0);

    const shippingLines = [
      order.shipping_name  && `<strong>${order.shipping_name}</strong>`,
      order.shipping_phone && order.shipping_phone,
      order.shipping_street && order.shipping_street,
      order.shipping_state && `Area: ${order.shipping_state}`,
      order.shipping_city  && `District: ${order.shipping_city}`,
      order.shipping_country && order.shipping_country,
    ].filter(Boolean).join('<br>');

    const itemRows = items.map(it => `
      <tr>
        <td>${it.product_name || 'Product'}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${fmt(it.price)}</td>
        <td style="text-align:right">${fmt(it.total || it.price * it.quantity)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice — ${order.order_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 32px 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 24px; font-weight: 700; color: #16a34a; letter-spacing: -0.5px; }
  .brand span { display: block; font-size: 11px; font-weight: 400; color: #666; margin-top: 2px; }
  .inv-meta { text-align: right; }
  .inv-meta h2 { font-size: 20px; color: #111; text-transform: uppercase; letter-spacing: 2px; }
  .inv-meta p { font-size: 12px; color: #666; margin-top: 4px; }
  .inv-meta .status { display: inline-block; margin-top: 6px; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #15803d; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
  .box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px; }
  .box p { font-size: 12.5px; line-height: 1.7; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  tbody tr:last-child td { border-bottom: none; }
  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  .totals-row:last-child { border-bottom: none; }
  .totals-row.total { font-weight: 700; font-size: 15px; color: #16a34a; border-top: 2px solid #e5e7eb; padding-top: 10px; margin-top: 4px; }
  .totals-row.shipping-row .label { color: #555; }
  .totals-row.shipping-row .val { color: #0369a1; font-weight: 600; }
  .totals-row.discount-row .val { color: #dc2626; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .no-print { display: none; }
    .page { padding: 16px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      Sholok
      <span>sholok.com</span>
    </div>
    <div class="inv-meta">
      <h2>Invoice</h2>
      <p>Order: <strong>${order.order_number}</strong></p>
      <p>Date: ${new Date(order.created_at).toLocaleDateString('en-BD', { year:'numeric', month:'long', day:'numeric' })}</p>
      <span class="status">${order.status || 'pending'}</span>
    </div>
  </div>

  <div class="grid-2">
    <div class="box">
      <h3>Customer</h3>
      <p>
        <strong>${order.customer_name || order.shipping_name || '—'}</strong><br>
        ${order.customer_email ? order.customer_email + '<br>' : ''}
        ${order.customer_phone || order.shipping_phone || ''}
      </p>
    </div>
    <div class="box">
      <h3>Delivery Address</h3>
      <p>${shippingLines || '—'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span class="label">Subtotal</span>
      <span class="val">${fmt(subtotal)}</span>
    </div>
    ${deliveryCharge > 0 ? `
    <div class="totals-row shipping-row">
      <span class="label">Shipping / Delivery</span>
      <span class="val">${fmt(deliveryCharge)}</span>
    </div>` : ''}
    ${discount > 0 ? `
    <div class="totals-row discount-row">
      <span class="label">Discount</span>
      <span class="val">− ${fmt(discount)}</span>
    </div>` : ''}
    <div class="totals-row total">
      <span>Total</span>
      <span>${fmt(total)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Payment: ${(order.payment_method || '').replace(/_/g, ' ')} &nbsp;|&nbsp; Payment Status: ${order.payment_status || '—'}</p>
    <p style="margin-top:6px">Thank you for shopping at Sholok! &nbsp;·&nbsp; sholok.com</p>
    <p style="margin-top:10px" class="no-print">
      <button onclick="window.print()" style="padding:8px 20px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">🖨 Print / Save PDF</button>
    </p>
  </div>
</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).send(`<h2>Error: ${e.message}</h2>`);
  }
});

module.exports = router;
