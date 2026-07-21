const nodemailer = require('nodemailer')
require('dotenv').config()

const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

if (!hasSmtpConfig) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️  SMTP_* env vars are not fully set. Emails will be logged to the ' +
    'console instead of actually sent — see backend/README.md to configure Brevo.'
  )
}

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // Brevo uses STARTTLS on 587, not implicit TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

module.exports = { transporter, hasSmtpConfig }
