const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const emailService = require('../services/emailService')
const { ContactMessage, NewsletterSubscriber } = require('../models')

// @route  POST /api/contact
const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body
  const entry = await ContactMessage.create({ name, email, subject, message })
  emailService.sendContactAutoReplyEmail({ name, email }).catch(() => {})
  return created(res, { message: 'Thanks! We will get back to you soon.', id: entry.id })
})

// @route  POST /api/newsletter/subscribe
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body
  const [, isNew] = await NewsletterSubscriber.findOrCreate({ where: { email } })
  if (isNew) emailService.sendNewsletterWelcomeEmail(email).catch(() => {})
  return ok(res, { message: isNew ? 'Subscribed successfully' : 'You are already subscribed' })
})

// ---------- Admin ----------

const adminListMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] })
  return ok(res, messages)
})

const resolveMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByPk(req.params.id)
  if (!msg) return fail(res, 404, 'Message not found')
  msg.isResolved = true
  await msg.save()
  await recordActivity(req, 'contact.resolve', { messageId: msg.id })
  return ok(res, msg)
})

const adminListSubscribers = asyncHandler(async (req, res) => {
  const subs = await NewsletterSubscriber.findAll({ order: [['createdAt', 'DESC']] })
  return ok(res, subs)
})

module.exports = {
  submitContactMessage,
  subscribeNewsletter,
  adminListMessages,
  resolveMessage,
  adminListSubscribers,
}
