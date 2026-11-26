const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const [[order]] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number = ? LIMIT 1`,
      [orderNumber]
    );

    if (!order) return res.status(404).send('<h2 style="font-family:sans-serif;padding:40px">Order not found</h2>');

    const [items] = await pool.query(
      `SELECT oi.*,
              p.sku,
              cat.name AS category_name,
              b.name AS brand_name
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories cat ON cat.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 0 });

    const orderDate = new Date(order.created_at);
    const dateStr = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
      ' · ' + orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const name = order.delivery_full_name || order.shipping_name || order.customer_name || '';
    const phone = order.delivery_phone || order.shipping_phone || order.customer_phone || '';
    const line1 = order.delivery_address_line1 || order.shipping_street || '';
    const line2 = order.delivery_address_line2 || '';
    const city = order.delivery_city || order.shipping_city || '';
    const area = order.delivery_area || '';
    const state = order.shipping_state || '';
    const country = order.shipping_country || 'Bangladesh';

    const addrLine2 = [area, city, state].filter(Boolean).join(', ');

    const paymentLabel = (order.payment_method || 'cash_on_delivery')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const statusColor = {
      pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
      shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444', refunded: '#6b7280',
    }[order.status] || '#f59e0b';

    const payStatusColor = order.payment_status === 'paid' ? '#10b981' : '#f59e0b';

    const itemRows = items.map((it, i) => {
      const num = String(i + 1).padStart(2, '0');
      const tags = [it.category_name, it.brand_name || it.vendor_name].filter(Boolean);
      return `
        <tr>
          <td class="num">${num}</td>
          <td>
            <div class="item-name">${it.product_name || 'Product'}</div>
            ${it.variant_name ? `<div class="item-sub">${it.variant_name}</div>` : ''}
            ${tags.length ? `<div class="item-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
          </td>
          <td class="sku">${it.sku || '—'}</td>
          <td class="center">${it.quantity}</td>
          <td class="right">${fmt(it.price)}</td>
          <td class="right bold">${fmt(it.total)}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice — ${order.order_number}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #f5f5f5; }

  .topbar { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 12px 40px; display: flex; justify-content: flex-end; gap: 10px; }
  .topbar button { padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid #d1d5db; background: #fff; color: #374151; display: inline-flex; align-items: center; gap: 6px; }
  .topbar button.primary { background: #00796b; border-color: #00796b; color: #fff; }
  .topbar button:hover { opacity: 0.85; }

  .page { max-width: 780px; margin: 30px auto 50px; background: #fff; border-radius: 10px; box-shadow: 0 2px 16px rgba(0,0,0,0.10); overflow: hidden; }

  .inv-header { padding: 36px 40px 28px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { font-size: 30px; font-weight: 900; letter-spacing: 2px; color: #111; }
  .inv-right { text-align: right; }
  .inv-right h2 { font-size: 26px; font-weight: 800; color: #111; letter-spacing: 3px; }
  .inv-right .order-num { color: #00796b; font-size: 14px; font-weight: 700; margin-top: 4px; }

  .boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px 40px; }
  .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; }
  .box-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 10px; }
  .box p { line-height: 1.8; color: #374151; }
  .box strong { color: #111; }
  .box .detail-row { display: flex; justify-content: space-between; line-height: 2; }
  .box .detail-row span:last-child { font-weight: 600; color: #111; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

  .items-section { padding: 0 40px 24px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
  thead th { padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; text-align: left; }
  th.right, td.right { text-align: right; }
  th.center, td.center { text-align: center; }
  td { padding: 14px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  td.num { color: #9ca3af; font-weight: 700; font-size: 12px; width: 36px; }
  td.sku { color: #6b7280; font-family: monospace; font-size: 11px; white-space: nowrap; }
  .item-name { font-weight: 600; color: #111; margin-bottom: 2px; }
  .item-sub { color: #6b7280; font-size: 12px; }
  .item-tags { margin-top: 4px; display: flex; gap: 5px; flex-wrap: wrap; }
  .tag { background: #f0fdf4; color: #065f46; border: 1px solid #d1fae5; border-radius: 4px; font-size: 10px; padding: 1px 7px; font-weight: 600; }
  .bold { font-weight: 700; }

  .bottom { padding: 20px 40px 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
  .terms h4 { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 10px; }
  .terms ul { padding-left: 16px; }
  .terms ul li { color: #6b7280; font-size: 12px; line-height: 1.9; }

  .totals-box { }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .totals-row:last-child { border-bottom: none; margin-top: 4px; padding-top: 12px; }
  .grand { font-size: 16px; font-weight: 800; color: #00796b; }

  .inv-footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 40px; text-align: center; }
  .inv-footer p { color: #6b7280; font-size: 12px; line-height: 1.8; }
  .inv-footer strong { color: #111; }

  @media print {
    body { background: #fff; }
    .topbar { display: none !important; }
    .page { box-shadow: none; margin: 0; border-radius: 0; }
  }
</style>
</head>
<body>

<div class="topbar no-print">
  <button onclick="window.print()">🖨️ Print Invoice</button>
  <button class="primary" onclick="window.print()">⬇ Download PDF</button>
</div>

<div class="page">
  <!-- Header -->
  <div class="inv-header">
    <div class="logo">SHOLOK</div>
    <div class="inv-right">
      <h2>INVOICE</h2>
      <div class="order-num">#${order.order_number}</div>
    </div>
  </div>

  <!-- Info Boxes -->
  <div class="boxes">
    <div class="box">
      <div class="box-label">Customer Details</div>
      <p><strong>${name}</strong></p>
      ${line1 ? `<p>${line1}${line2 ? ', ' + line2 : ''}</p>` : ''}
      ${addrLine2 ? `<p>${addrLine2}, ${country}</p>` : `<p>${country}</p>`}
      ${phone ? `<p>Phone: ${phone}</p>` : ''}
      ${order.customer_email ? `<p>${order.customer_email}</p>` : ''}
    </div>
    <div class="box">
      <div class="box-label">Invoice Details</div>
      <div class="detail-row"><span>Order ID:</span><span>${order.order_number}</span></div>
      <div class="detail-row"><span>Order Date:</span><span>${dateStr}</span></div>
      <div class="detail-row"><span>Payment Method:</span><span>${paymentLabel}</span></div>
      <div class="detail-row"><span>Payment Status:</span>
        <span><span class="badge" style="background:${payStatusColor}22;color:${payStatusColor}">${order.payment_status || 'Pending'}</span></span>
      </div>
      <div class="detail-row"><span>Order Status:</span>
        <span><span class="badge" style="background:${statusColor}22;color:${statusColor}">${order.status || 'Pending'}</span></span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <div class="items-section">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Description</th>
          <th>SKU</th>
          <th class="center">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <!-- Bottom: Terms + Totals -->
  <div class="bottom">
    <div class="terms">
      <h4>Terms &amp; Conditions</h4>
      <ul>
        <li>This is a system-generated invoice.</li>
        <li>Please retain this invoice for your records.</li>
        <li>Product return/refund is subject to Sholok's return policy.</li>
        <li>COD orders must be paid at the time of delivery.</li>
        <li>Delivery time may vary depending on location.</li>
      </ul>
    </div>
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
      <div class="totals-row"><span>Delivery Charge</span><span>${fmt(order.delivery_charge || order.shipping)}</span></div>
      ${Number(order.discount) > 0 ? `<div class="totals-row"><span>Discount</span><span style="color:#ef4444">-${fmt(order.discount)}</span></div>` : ''}
      ${Number(order.tax) > 0 ? `<div class="totals-row"><span>Tax</span><span>${fmt(order.tax)}</span></div>` : ''}
      <div class="totals-row grand"><span>Grand Total</span><span>${fmt(order.total)}</span></div>
    </div>
  </div>

  <!-- Footer -->
  <div class="inv-footer">
    <p>Thank you for shopping with <strong>Sholok</strong>!</p>
    <p>If you have any questions regarding this invoice, please contact <strong>support@sholok.com</strong></p>
  </div>
</div>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).send('<h2 style="font-family:sans-serif;padding:40px">Error generating invoice: ' + err.message + '</h2>');
  }
});

module.exports = router;
