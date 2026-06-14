const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Order = require("../models/Order");
const User  = require("../models/User");
const sslcz = require("../services/sslcommerz");

// ───────── STRIPE ─────────
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("your_")) {
      return res.status(400).json({ success: false, message: "Stripe is not configured." });
    }
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { amount, orderId } = req.body;
    const intent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100),
      currency: "bdt",
      metadata: { userId: req.user.id, orderId: orderId || "" },
    });
    res.json({ success: true, clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stripe webhook (raw body needed)
router.post("/stripe/webhook", async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).json({ message: "Webhook not configured" });
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) { return res.status(400).send(`Webhook Error: ${e.message}`); }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    if (pi.metadata?.orderId) {
      await Order.findByIdAndUpdate(pi.metadata.orderId, {
        paymentStatus: "paid",
        "paymentDetails.transactionId": pi.id,
        "paymentDetails.paidAt": new Date(),
      });
    }
  }
  res.json({ received: true });
});

// ───────── SSLCOMMERZ ─────────
// Initiate payment session — returns gateway URL to redirect to
router.post("/sslcommerz/init/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.customer) !== String(req.user.id))
      return res.status(403).json({ success: false, message: "Not your order" });

    const customer = await User.findById(req.user.id);
    const callbackBase = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const session = await sslcz.initPayment({ order, customer, callbackBase });

    order.paymentDetails = { ...(order.paymentDetails || {}), tran_id: session.tran_id, gateway: "sslcommerz" };
    await order.save();

    res.json({ success: true, gatewayUrl: session.GatewayPageURL, sessionkey: session.sessionkey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SSLCommerz success callback
router.post("/sslcommerz/success", async (req, res) => {
  try {
    const { order } = req.query;
    const { val_id } = req.body;
    const valid = await sslcz.validateTransaction(val_id);
    if (valid.status === "VALID" || valid.status === "VALIDATED") {
      await Order.findByIdAndUpdate(order, {
        paymentStatus: "paid",
        orderStatus:   "confirmed",
        "paymentDetails.val_id":  val_id,
        "paymentDetails.bank_tran_id": valid.bank_tran_id,
        "paymentDetails.paidAt":  new Date(),
      });
    }
    res.redirect(`${process.env.CLIENT_URL}/order-success?order=${order}`);
  } catch {
    res.redirect(`${process.env.CLIENT_URL}/order-failed`);
  }
});

router.post("/sslcommerz/fail", async (req, res) => {
  const { order } = req.query;
  await Order.findByIdAndUpdate(order, { paymentStatus: "failed" });
  res.redirect(`${process.env.CLIENT_URL}/order-failed?order=${order}`);
});

router.post("/sslcommerz/cancel", async (req, res) => {
  const { order } = req.query;
  await Order.findByIdAndUpdate(order, { paymentStatus: "failed", orderStatus: "cancelled" });
  res.redirect(`${process.env.CLIENT_URL}/order-cancelled?order=${order}`);
});

router.post("/sslcommerz/ipn", async (req, res) => {
  // Async server-to-server confirmation
  res.json({ received: true });
});

// ───────── NAVER PAY ─────────
// Korean checkout flow. Real integration uses Naver Pay Open API
// (https://developer.pay.naver.com). Configure these env vars:
//   NAVER_PAY_CLIENT_ID, NAVER_PAY_CLIENT_SECRET, NAVER_PAY_PARTNER_ID,
//   NAVER_PAY_MODE ("sandbox" | "production")
//
// 1) Reserve payment (server-to-server) — returns a paymentId & redirect URL
router.post("/naverpay/reserve/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.customer) !== String(req.user.id))
      return res.status(403).json({ success: false, message: "Not your order" });

    const cfg = {
      clientId:     process.env.NAVER_PAY_CLIENT_ID,
      clientSecret: process.env.NAVER_PAY_CLIENT_SECRET,
      partnerId:    process.env.NAVER_PAY_PARTNER_ID,
      mode:         process.env.NAVER_PAY_MODE || "sandbox",
    };

    if (!cfg.clientId || !cfg.clientSecret || !cfg.partnerId) {
      return res.status(400).json({
        success: false,
        message: "Naver Pay is not configured. Set NAVER_PAY_CLIENT_ID, NAVER_PAY_CLIENT_SECRET, NAVER_PAY_PARTNER_ID.",
      });
    }

    // TODO: replace this stub with a real call to Naver Pay reservation API
    // (https://developer.pay.naver.com/docs/v2/api). The expected response
    // returns a `paymentId` that the client must hand to the JS SDK.
    const reservationId = "NPAY_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    const returnUrl = `${process.env.SERVER_URL || ""}/api/v1/payments/naverpay/return/${order._id}`;

    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      gateway:        "naverpay",
      reservationId,
      reservedAt:     new Date(),
      mode:           cfg.mode,
    };
    order.paymentMethod = "naverpay";
    await order.save();

    res.json({
      success:        true,
      paymentId:      reservationId,
      reservationId,
      returnUrl,
      mode:           cfg.mode,
      // Frontend should call window.Naver.Pay.create({ ... }).open({ paymentId })
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2) Approve payment after Naver returns the user (called by client with paymentId)
router.post("/naverpay/approve", protect, async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    if (!orderId || !paymentId)
      return res.status(400).json({ success: false, message: "orderId and paymentId required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.customer) !== String(req.user.id))
      return res.status(403).json({ success: false, message: "Not your order" });

    // TODO: call Naver Pay 'apply/payment' API with paymentId to finalize.
    // On success Naver returns approval info — we mark the order paid.
    order.paymentStatus = "paid";
    order.orderStatus   = "confirmed";
    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      gateway:       "naverpay",
      paymentId,
      approvedAt:    new Date(),
    };
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3) Server-side return URL (Naver redirects user here after consent)
router.get("/naverpay/return/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const ok = req.query.resultCode === "Success";
  const target = ok
    ? `${process.env.CLIENT_URL}/order-success?order=${orderId}&gateway=naverpay`
    : `${process.env.CLIENT_URL}/order-failed?order=${orderId}&gateway=naverpay`;
  res.redirect(target);
});

module.exports = router;
