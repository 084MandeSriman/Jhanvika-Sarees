const crypto = require('crypto')
const razorpay = require('../config/razorpay')

/**
 * Creates a Razorpay order. Amount must be in the smallest currency unit
 * (paise for INR), which is why callers multiply rupees by 100.
 */
async function createRazorpayOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  try {
    return await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt,
      notes,
    })
  } catch (err) {
    // Log SDK error details to help diagnose 4xx/5xx responses from Razorpay
    // Avoid logging full secrets; log structured info instead.
    // eslint-disable-next-line no-console
    console.error('Razorpay order creation failed:', {
      message: err && err.message,
      statusCode: err && err.statusCode,
      body: err && err.error,
    })
    throw err
  }
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay sends back after a successful
 * checkout. This is the ONLY reliable way to confirm a payment actually
 * succeeded — never trust a client-side "success" callback alone.
 * Formula (per Razorpay docs): HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 */
function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')
  return expected === razorpaySignature
}

/**
 * Verifies a Razorpay webhook payload signature (X-Razorpay-Signature header).
 * Used if/when you wire up a webhook endpoint in addition to the client-side
 * verify flow, for defense in depth against missed client callbacks.
 */
function verifyWebhookSignature({ body, signature, secret }) {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}

async function fetchPayment(paymentId) {
  return razorpay.payments.fetch(paymentId)
}

module.exports = { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature, fetchPayment }
