const asyncHandler = require('../utils/asyncHandler')
const { ok, fail } = require('../utils/apiResponse')
const emailService = require('../services/emailService')
const { EmailLog, Order } = require('../models')

// @route  GET /api/admin/email-logs
const adminListEmailLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 30)
  const offset = (page - 1) * limit
  const where = {}
  if (req.query.status) where.status = req.query.status
  if (req.query.type) where.type = req.query.type

  const { rows, count } = await EmailLog.findAndCountAll({
    where,
    include: [{ model: Order, attributes: ['orderNumber'], required: false }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

// @route  POST /api/email/send-test  (admin only) — body: { to }
// Sends a lightweight test email through the live Brevo SMTP config so an
// admin can confirm credentials work without waiting for a real order/registration.
const sendTestEmail = asyncHandler(async (req, res) => {
  const { to } = req.body
  if (!to) return fail(res, 400, 'A destination email address is required')

  await emailService.sendEmail({
    to,
    subject: 'Jhanvika — Test Email',
    html: `<p>This is a test email confirming your Brevo SMTP configuration is working.</p><p>Sent at ${new Date().toLocaleString('en-IN')}.</p>`,
    type: 'test',
  })
  return ok(res, { message: `Test email dispatched to ${to} — check Email Logs for delivery status.` })
})

module.exports = { adminListEmailLogs, sendTestEmail }
