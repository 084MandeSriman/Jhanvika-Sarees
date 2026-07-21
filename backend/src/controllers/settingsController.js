const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { Setting } = require('../models')

// Settings are stored as flat key/value rows grouped by `group`
// (general | payment | shipping | tax | seo | social | email | sms).

const PUBLIC_GROUPS = ['general', 'shipping', 'tax', 'social', 'seo']

// @route  GET /api/settings — public, storefront-safe groups only (no payment/email/sms secrets)
const getPublicSettings = asyncHandler(async (req, res) => {
  const rows = await Setting.findAll({ where: { group: PUBLIC_GROUPS } })
  const map = {}
  rows.forEach((r) => { map[r.key] = r.value })
  return ok(res, map)
})

const getSettings = asyncHandler(async (req, res) => {
  const where = {}
  if (req.query.group) where.group = req.query.group
  const rows = await Setting.findAll({ where })
  const map = {}
  rows.forEach((r) => { map[r.key] = r.value })
  return ok(res, map)
})

// @route  PUT /api/admin/settings   body: { group, values: { key: value, ... } }
const updateSettings = asyncHandler(async (req, res) => {
  const { group = 'general', values = {} } = req.body
  const entries = Object.entries(values)
  for (const [key, value] of entries) {
    await Setting.upsert({ key, value: String(value), group })
  }
  await recordActivity(req, 'settings.update', { group, keys: Object.keys(values) })
  return ok(res, { message: 'Settings updated' })
})

module.exports = { getPublicSettings, getSettings, updateSettings }
