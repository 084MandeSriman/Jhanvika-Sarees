const { Op, fn, col } = require('sequelize')
const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/apiResponse')
const { SearchLog } = require('../models')

// @route  GET /api/search/trending
// Top searched terms in the last 7 days — powers "trending searches" in the nav search UI.
const trending = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const rows = await SearchLog.findAll({
    where: { createdAt: { [Op.gte]: since } },
    attributes: ['query', [fn('COUNT', col('id')), 'count']],
    group: ['query'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 8,
    raw: true,
  })
  return ok(res, rows.map((r) => r.query))
})

// ---------- Admin ----------

// @route  GET /api/admin/search-analytics
const adminSearchAnalytics = asyncHandler(async (req, res) => {
  const topSearches = await SearchLog.findAll({
    attributes: ['query', [fn('COUNT', col('id')), 'count']],
    group: ['query'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 20,
    raw: true,
  })
  const noResultSearches = await SearchLog.findAll({
    where: { resultsCount: 0 },
    attributes: ['query', [fn('COUNT', col('id')), 'count']],
    group: ['query'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 20,
    raw: true,
  })
  return ok(res, { topSearches, noResultSearches })
})

module.exports = { trending, adminSearchAnalytics }
