const router   = require("express").Router();
const PDFDocument = require("pdfkit");
const Order    = require("../models/Order");
const Setting  = require("../models/Setting");
const { protect } = require("../middleware/auth");

/**
 * GET /api/v1/invoices/:orderId
 * Streams a PDF invoice for the given order.
 * Buyer (owner), seller (any item from their store), or admin can access.
 */
router.get("/:orderId", protect, async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate("customer", "name email phone")
    .populate("items.product", "name images")
    .populate("items.store", "name smartStore");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  // Authorization
  const isOwner  = String(order.customer._id) === String(req.user.id);
  const isAdmin  = req.user.role === "admin";
  const isSeller = req.user.role === "seller" && order.items.some((it) =>
    String(it.store?._id || it.store) === String(req.user.storeId || "")
  );
  if (!isOwner && !isAdmin && !isSeller) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const settings = await Setting.get();
  const symbol   = settings.currencySymbol || "৳";

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="invoice-${order.orderNumber}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fillColor("#6c47ff").fontSize(22).text(settings.siteName || "Sholok eCommerce", { align: "left" });
  doc.fillColor("#6b7280").fontSize(10).text(settings.siteTagline || "", { align: "left" });
  doc.moveDown(0.5);
  doc.fillColor("#111827").fontSize(16).text("INVOICE", { align: "right" });
  doc.fillColor("#6b7280").fontSize(10).text(`#${order.orderNumber}`, { align: "right" });
  doc.text(new Date(order.createdAt).toLocaleDateString(), { align: "right" });
  doc.moveDown(1.5);

  // Bill to
  doc.fillColor("#111827").fontSize(11).text("Bill To:", { underline: true });
  doc.fillColor("#1f2937").fontSize(10);
  doc.text(order.customer.name);
  doc.text(order.customer.email);
  if (order.shippingAddress) {
    doc.text(`${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}`);
    doc.text(`${order.shippingAddress.state || ""} ${order.shippingAddress.zip || ""}, ${order.shippingAddress.country || ""}`);
    if (order.shippingAddress.phone) doc.text(`Tel: ${order.shippingAddress.phone}`);
  }
  doc.moveDown(1);

  // Items table
  const tableTop = doc.y;
  doc.fillColor("#6c47ff").rect(50, tableTop, 495, 22).fill();
  doc.fillColor("#fff").fontSize(10);
  doc.text("Item",     58,  tableTop + 7);
  doc.text("Qty",      330, tableTop + 7);
  doc.text("Price",    380, tableTop + 7);
  doc.text("Subtotal", 470, tableTop + 7, { width: 75, align: "right" });

  let y = tableTop + 26;
  doc.fillColor("#1f2937").fontSize(10);
  for (const item of order.items) {
    if (y > 700) { doc.addPage(); y = 60; }
    doc.text(item.name.slice(0, 50), 58, y, { width: 260 });
    doc.text(String(item.quantity),  330, y);
    doc.text(`${symbol}${item.price.toLocaleString()}`, 380, y);
    doc.text(`${symbol}${(item.price * item.quantity).toLocaleString()}`, 470, y, { width: 75, align: "right" });
    y += 22;
    doc.moveTo(50, y - 4).lineTo(545, y - 4).strokeColor("#e5e7eb").stroke();
  }

  y += 10;
  // Summary
  const summaryX = 380;
  const valueX   = 470;
  const row = (label, val, bold = false) => {
    if (bold) doc.fillColor("#111827").fontSize(12); else doc.fillColor("#374151").fontSize(10);
    doc.text(label, summaryX, y);
    doc.text(`${symbol}${val.toLocaleString()}`, valueX, y, { width: 75, align: "right" });
    y += bold ? 22 : 18;
  };
  row("Subtotal",    order.subtotal || 0);
  if (order.discount) row("Discount", -order.discount);
  row("Shipping",   order.shippingFee || 0);
  if (order.tax)      row("Tax",         order.tax);
  doc.moveTo(summaryX, y).lineTo(545, y).strokeColor("#374151").stroke();
  y += 6;
  row("TOTAL",       order.totalAmount || 0, true);

  doc.moveDown(2);
  doc.fillColor("#9ca3af").fontSize(9);
  doc.text("Thank you for shopping with us!", 50, 760, { align: "center", width: 495 });
  doc.text(`${settings.siteName || "Sholok"} · ${settings.supportEmail || ""}`, { align: "center", width: 495 });

  doc.end();
});

module.exports = router;
