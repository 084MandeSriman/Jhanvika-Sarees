const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/apiResponse')
const { ActivityLog, User } = require('../models')

// @route  GET /api/admin/activity-logs
const listActivityLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 50)
  const offset = (page - 1) * limit

  const { rows, count } = await ActivityLog.findAndCountAll({
    include: [{ model: User, attributes: ['name', 'email'], required: false }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

module.exports = { listActivityLogs }
