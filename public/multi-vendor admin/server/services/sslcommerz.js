const axios = require("axios");

/**
 * SSLCommerz payment gateway integration (Bangladesh).
 * Sandbox: sandbox.sslcommerz.com  ·  Live: securepay.sslcommerz.com
 */
const STORE_ID  = process.env.SSLCZ_STORE_ID || "";
const STORE_PWD = process.env.SSLCZ_STORE_PASSWORD || "";
const IS_LIVE   = process.env.SSLCZ_IS_LIVE === "true";

const BASE = IS_LIVE
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const isConfigured = () => Boolean(STORE_ID && STORE_PWD && STORE_ID !== "your_sslcommerz_store_id");

/**
 * Initiate a payment session with SSLCommerz.
 * @returns {Promise<{ GatewayPageURL: string, sessionkey: string }>}
 */
async function initPayment({ order, customer, callbackBase }) {
  if (!isConfigured()) throw new Error("SSLCommerz not configured. Set SSLCZ_STORE_ID and SSLCZ_STORE_PASSWORD.");

  const tran_id = `SHO-${Date.now()}-${order._id}`;

  const data = {
    store_id:  STORE_ID,
    store_passwd: STORE_PWD,
    total_amount: order.totalAmount,
    currency:     "BDT",
    tran_id,
    success_url:  `${callbackBase}/api/v1/payments/sslcommerz/success?order=${order._id}`,
    fail_url:     `${callbackBase}/api/v1/payments/sslcommerz/fail?order=${order._id}`,
    cancel_url:   `${callbackBase}/api/v1/payments/sslcommerz/cancel?order=${order._id}`,
    ipn_url:      `${callbackBase}/api/v1/payments/sslcommerz/ipn`,
    cus_name:     customer.name,
    cus_email:    customer.email,
    cus_add1:     order.shippingAddress?.street || "N/A",
    cus_city:     order.shippingAddress?.city   || "Dhaka",
    cus_postcode: order.shippingAddress?.zip    || "1200",
    cus_country:  order.shippingAddress?.country || "Bangladesh",
    cus_phone:    order.shippingAddress?.phone  || "01700000000",
    shipping_method: "YES",
    ship_name:    order.shippingAddress?.fullName || customer.name,
    ship_add1:    order.shippingAddress?.street   || "N/A",
    ship_city:    order.shippingAddress?.city     || "Dhaka",
    ship_postcode:order.shippingAddress?.zip      || "1200",
    ship_country: "Bangladesh",
    product_name:     `Order #${order.orderNumber}`,
    product_category: "general",
    product_profile:  "general",
    num_of_item:      order.items.length,
  };

  const params = new URLSearchParams(data);
  const { data: resp } = await axios.post(
    `${BASE}/gwprocess/v4/api.php`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (resp.status !== "SUCCESS") throw new Error(resp.failedreason || "SSLCommerz init failed");
  return { ...resp, tran_id };
}

/** Validate a transaction with SSLCommerz (server-to-server check) */
async function validateTransaction(val_id) {
  const url = `${BASE}/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PWD}&format=json`;
  const { data } = await axios.get(url);
  return data;
}

module.exports = { initPayment, validateTransaction, isConfigured, BASE };
