const SITE_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const SUPPORT_EMAIL = process.env.EMAIL_FROM || 'hello@jhanvika.example'
const BRAND = process.env.EMAIL_NAME || 'Jhanvika Sarees'

/**
 * Wraps inner HTML in a single responsive, table-based layout (table layout
 * is deliberate — it's still the most reliable approach across email
 * clients like Outlook desktop). Every template in this folder calls this
 * once so the header/footer/brand styling lives in exactly one place.
 */
function layout({ preheader = '', title, bodyHtml, ctaLabel, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F4EF;font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:1px;color:#F7F4EF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F4EF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FBF6EE;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#6B1E3C,#4A1329);padding:28px 32px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:26px;color:#E4C97A;letter-spacing:1px;">${BRAND}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;color:#2B1B17;font-size:15px;line-height:1.6;">
              ${bodyHtml}
              ${ctaUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
                <tr>
                  <td style="border-radius:999px;background-color:#6B1E3C;">
                    <a href="${ctaUrl}" style="display:inline-block;padding:13px 32px;color:#FBF6EE;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>` : ''}
            </td>
          </tr>
          <tr>
            <td style="background-color:#2B1B17;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px;color:#FBF6EE;font-size:13px;">${BRAND}</p>
              <p style="margin:0 0 6px;color:#ffffffa6;font-size:11px;">Banjara Hills, Hyderabad, Telangana, India</p>
              <p style="margin:0 0 10px;color:#ffffffa6;font-size:11px;">Support: <a href="mailto:${SUPPORT_EMAIL}" style="color:#E4C97A;">${SUPPORT_EMAIL}</a></p>
              <p style="margin:0;color:#ffffff59;font-size:10px;">You're receiving this email because of activity on your ${BRAND} account.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function money(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function itemsTable(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;">
    ${items.map((it) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee2cf;font-size:13px;">${it.name} × ${it.qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee2cf;font-size:13px;text-align:right;">${money(it.price * it.qty)}</td>
    </tr>`).join('')}
  </table>`
}

// ---------- Templates ----------

function welcomeEmail({ name }) {
  return layout({
    title: `Welcome to ${BRAND}`,
    preheader: `Welcome to ${BRAND}, ${name}!`,
    bodyHtml: `<p>Namaste ${name},</p>
      <p>Welcome to ${BRAND} — a curated house of handwoven sarees. Your account is ready, and we can't wait for you to explore our Banarasi, Kanjivaram, and Chanderi collections.</p>`,
    ctaLabel: 'Start Shopping',
    ctaUrl: `${SITE_URL}/shop`,
  })
}

function verificationEmail({ name, verifyUrl }) {
  return layout({
    title: 'Verify your email',
    preheader: 'Please verify your email address',
    bodyHtml: `<p>Hi ${name},</p><p>Please confirm this is your email address to finish setting up your ${BRAND} account. This link expires in 24 hours.</p>`,
    ctaLabel: 'Verify Email',
    ctaUrl: verifyUrl,
  })
}

function forgotPasswordEmail({ name, resetUrl }) {
  return layout({
    title: 'Reset your password',
    preheader: 'Reset your password',
    bodyHtml: `<p>Hi ${name},</p><p>We received a request to reset your ${BRAND} password. This link is valid for 30 minutes. If you didn't request this, you can safely ignore this email.</p>`,
    ctaLabel: 'Reset Password',
    ctaUrl: resetUrl,
  })
}

function passwordResetSuccessEmail({ name }) {
  return layout({
    title: 'Password changed',
    preheader: 'Your password was changed successfully',
    bodyHtml: `<p>Hi ${name},</p><p>Your ${BRAND} account password was just changed. If this wasn't you, please contact us immediately at ${SUPPORT_EMAIL}.</p>`,
  })
}

function orderConfirmationEmail({ name, order }) {
  return layout({
    title: `Order Confirmed — ${order.orderNumber}`,
    preheader: `Your order ${order.orderNumber} has been confirmed`,
    bodyHtml: `<p>Hi ${name},</p>
      <p>Thank you for your order! Here's your confirmation for <strong>${order.orderNumber}</strong>.</p>
      ${itemsTable(order.items)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-top:8px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${money(order.subtotal)}</td></tr>
        ${order.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${money(order.discount)}</td></tr>` : ''}
        <tr><td>GST</td><td style="text-align:right;">${money(order.tax)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right;">${order.shippingFee > 0 ? money(order.shippingFee) : 'Free'}</td></tr>
        <tr><td style="font-weight:bold;padding-top:6px;">Grand Total</td><td style="text-align:right;font-weight:bold;padding-top:6px;">${money(order.total)}</td></tr>
      </table>
      <p style="margin-top:20px;">Payment Method: <strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</strong></p>
      <p>Delivery Address:<br/>${order.shippingAddress.fullName}, ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
      <p>Estimated Delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</strong></p>`,
    ctaLabel: 'Track Your Order',
    ctaUrl: `${SITE_URL}/account`,
  })
}

function paymentSuccessEmail({ name, order, payment }) {
  return layout({
    title: 'Payment Successful',
    preheader: `We've received your payment for ${order.orderNumber}`,
    bodyHtml: `<p>Hi ${name},</p>
      <p>We've successfully received your payment of <strong>${money(payment.amount)}</strong> for order <strong>${order.orderNumber}</strong>.</p>
      <p>Payment ID: ${payment.razorpayPaymentId}</p>`,
    ctaLabel: 'View Order',
    ctaUrl: `${SITE_URL}/account`,
  })
}

function paymentFailedEmail({ name, order }) {
  return layout({
    title: 'Payment Failed',
    preheader: `Your payment for ${order.orderNumber} could not be processed`,
    bodyHtml: `<p>Hi ${name},</p>
      <p>Unfortunately your payment for order <strong>${order.orderNumber}</strong> could not be processed. No amount has been charged. You can retry the payment from your account.</p>`,
    ctaLabel: 'Retry Payment',
    ctaUrl: `${SITE_URL}/account`,
  })
}

function orderCancelledEmail({ name, order }) {
  return layout({
    title: 'Order Cancelled',
    preheader: `Order ${order.orderNumber} has been cancelled`,
    bodyHtml: `<p>Hi ${name},</p><p>Your order <strong>${order.orderNumber}</strong> has been cancelled. If a payment was made, your refund will be processed within 5-7 business days.</p>`,
  })
}

function orderShippedEmail({ name, order }) {
  return layout({
    title: 'Your Order Has Shipped',
    preheader: `Order ${order.orderNumber} is on its way`,
    bodyHtml: `<p>Hi ${name},</p>
      <p>Great news — your order <strong>${order.orderNumber}</strong> has shipped!</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-top:12px;">
        <tr><td>Courier</td><td style="text-align:right;">${order.courierName || 'Standard Courier'}</td></tr>
        <tr><td>Tracking Number</td><td style="text-align:right;">${order.trackingNumber}</td></tr>
      </table>`,
    ctaLabel: 'Track Shipment',
    ctaUrl: order.trackingUrl || `${SITE_URL}/account`,
  })
}

function orderDeliveredEmail({ name, order }) {
  return layout({
    title: 'Order Delivered',
    preheader: `Order ${order.orderNumber} has been delivered`,
    bodyHtml: `<p>Hi ${name},</p><p>Your order <strong>${order.orderNumber}</strong> has been delivered. We hope you love your new saree! We'd be grateful if you left a review.</p>`,
    ctaLabel: 'Leave a Review',
    ctaUrl: `${SITE_URL}/account`,
  })
}

function newsletterWelcomeEmail({ email }) {
  return layout({
    title: 'Welcome to the Jhanvika Circle',
    preheader: 'You are subscribed',
    bodyHtml: `<p>Hi there,</p><p>Thanks for subscribing to the ${BRAND} newsletter with ${email}. Expect new weaves, styling notes, and early access to festive drops.</p>`,
    ctaLabel: 'Explore Collection',
    ctaUrl: `${SITE_URL}/shop`,
  })
}

function contactAutoReplyEmail({ name }) {
  return layout({
    title: "We've received your message",
    preheader: 'Thanks for contacting us',
    bodyHtml: `<p>Hi ${name},</p><p>Thanks for reaching out to ${BRAND}. Our team typically responds within 24 hours on business days.</p>`,
  })
}

module.exports = {
  welcomeEmail,
  verificationEmail,
  forgotPasswordEmail,
  passwordResetSuccessEmail,
  orderConfirmationEmail,
  paymentSuccessEmail,
  paymentFailedEmail,
  orderCancelledEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  newsletterWelcomeEmail,
  contactAutoReplyEmail,
}
