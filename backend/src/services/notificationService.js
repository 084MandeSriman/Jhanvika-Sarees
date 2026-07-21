const emailService = require('./emailService')

function recipientOf(order, user) {
  if (user) return { email: user.email, name: user.name }
  return { email: order.guestEmail || order.shippingAddress?.email, name: order.shippingAddress?.fullName || 'there' }
}

async function notifyOrderConfirmed(order, user) {
  const { email, name } = recipientOf(order, user)
  if (!email) return
  try {
    await emailService.sendOrderConfirmationEmail(order, email, name)
  } catch {
    // Email failures never block the order flow — already logged in EmailLog.
  }
}

async function notifyPaymentSuccess(order, payment, user) {
  const { email, name } = recipientOf(order, user)
  if (!email) return
  try {
    await emailService.sendPaymentSuccessEmail(order, payment, email, name)
  } catch {
    // logged, non-fatal
  }
}

async function notifyPaymentFailed(order, user) {
  const { email, name } = recipientOf(order, user)
  if (!email) return
  try {
    await emailService.sendPaymentFailedEmail(order, email, name)
  } catch {
    // logged, non-fatal
  }
}

async function notifyOrderCancelled(order, user) {
  const { email, name } = recipientOf(order, user)
  if (!email) return
  try {
    await emailService.sendOrderCancelledEmail(order, email, name)
  } catch {
    // logged, non-fatal
  }
}

async function notifyOrderShipped(order, user) {
  const { email, name } = recipientOf(order, user)
  if (!email) return
  try {
    await emailService.sendOrderShippedEmail(order, email, name)
  } catch {
    // logged, non-fatal
  }
}

async function notifyOrderDelivered(order, user) {
  const { email, name } = recipientOf(order, user)
  if (!email) return
  try {
    await emailService.sendOrderDeliveredEmail(order, email, name)
  } catch {
    // logged, non-fatal
  }
}

module.exports = {
  notifyOrderConfirmed,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyOrderCancelled,
  notifyOrderShipped,
  notifyOrderDelivered,
}
