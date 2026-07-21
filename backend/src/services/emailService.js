const { transporter, hasSmtpConfig } = require('../config/mailer')
const templates = require('../emails/templates')

const FROM_NAME = process.env.EMAIL_NAME || 'Jhanvika Sarees'
const FROM_EMAIL = process.env.EMAIL_FROM || 'no-reply@jhanvika.example'

/**
 * The one function that actually sends mail. Every sendXEmail() helper below
 * calls this instead of touching nodemailer directly, so logging, the
 * from-address, and the "SMTP not configured" fallback all live in one place.
 */
async function sendEmail({ to, subject, html, type, orderId = null }) {
  const { EmailLog } = require('../models') // required lazily to avoid a require cycle with models/index.js

  if (!hasSmtpConfig) {
    // eslint-disable-next-line no-console
    console.log(`[SIMULATED EMAIL — SMTP not configured] To: ${to} | Subject: ${subject} | Type: ${type}`)
    await EmailLog.create({ toEmail: to, subject, type, status: 'sent', orderId, error: 'SMTP not configured — simulated' }).catch(() => {})
    return { simulated: true }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    await EmailLog.create({ toEmail: to, subject, type, status: 'sent', orderId }).catch(() => {})
    return info
  } catch (err) {
    await EmailLog.create({ toEmail: to, subject, type, status: 'failed', error: err.message, orderId }).catch(() => {})
    // eslint-disable-next-line no-console
    console.error(`[EMAIL FAILED] ${type} -> ${to}:`, err.message)
    throw err
  }
}

// Each helper below is intentionally a thin one-liner: build the HTML from a
// template, send it, tag it with a `type` for the admin Email Logs screen.
// Every call site wraps these in try/catch (or lets them fail silently) so a
// broken email never blocks the underlying business action (registration,
// checkout, etc).

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: `Welcome to ${FROM_NAME}!`,
    html: templates.welcomeEmail({ name: user.name }),
    type: 'welcome',
  })
}

async function sendVerificationEmail(user, verifyUrl) {
  return sendEmail({
    to: user.email,
    subject: 'Please verify your email',
    html: templates.verificationEmail({ name: user.name, verifyUrl }),
    type: 'email_verification',
  })
}

async function sendForgotPasswordEmail(user, resetUrl) {
  return sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: templates.forgotPasswordEmail({ name: user.name, resetUrl }),
    type: 'forgot_password',
  })
}

async function sendPasswordResetSuccessEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Your password was changed',
    html: templates.passwordResetSuccessEmail({ name: user.name }),
    type: 'password_reset_success',
  })
}

async function sendOrderConfirmationEmail(order, recipientEmail, recipientName) {
  return sendEmail({
    to: recipientEmail,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: templates.orderConfirmationEmail({ name: recipientName, order }),
    type: 'order_confirmation',
    orderId: order.id,
  })
}

async function sendPaymentSuccessEmail(order, payment, recipientEmail, recipientName) {
  return sendEmail({
    to: recipientEmail,
    subject: `Payment Received — ${order.orderNumber}`,
    html: templates.paymentSuccessEmail({ name: recipientName, order, payment }),
    type: 'payment_success',
    orderId: order.id,
  })
}

async function sendPaymentFailedEmail(order, recipientEmail, recipientName) {
  return sendEmail({
    to: recipientEmail,
    subject: `Payment Failed — ${order.orderNumber}`,
    html: templates.paymentFailedEmail({ name: recipientName, order }),
    type: 'payment_failed',
    orderId: order.id,
  })
}

async function sendOrderCancelledEmail(order, recipientEmail, recipientName) {
  return sendEmail({
    to: recipientEmail,
    subject: `Order Cancelled — ${order.orderNumber}`,
    html: templates.orderCancelledEmail({ name: recipientName, order }),
    type: 'order_cancelled',
    orderId: order.id,
  })
}

async function sendOrderShippedEmail(order, recipientEmail, recipientName) {
  return sendEmail({
    to: recipientEmail,
    subject: `Your Order Has Shipped — ${order.orderNumber}`,
    html: templates.orderShippedEmail({ name: recipientName, order }),
    type: 'order_shipped',
    orderId: order.id,
  })
}

async function sendOrderDeliveredEmail(order, recipientEmail, recipientName) {
  return sendEmail({
    to: recipientEmail,
    subject: `Delivered — ${order.orderNumber}`,
    html: templates.orderDeliveredEmail({ name: recipientName, order }),
    type: 'order_delivered',
    orderId: order.id,
  })
}

async function sendNewsletterWelcomeEmail(email) {
  return sendEmail({
    to: email,
    subject: `Welcome to the ${FROM_NAME} Circle`,
    html: templates.newsletterWelcomeEmail({ email }),
    type: 'newsletter_welcome',
  })
}

async function sendContactAutoReplyEmail({ name, email }) {
  return sendEmail({
    to: email,
    subject: "We've received your message",
    html: templates.contactAutoReplyEmail({ name }),
    type: 'contact_auto_reply',
  })
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderCancelledEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendNewsletterWelcomeEmail,
  sendContactAutoReplyEmail,
}
