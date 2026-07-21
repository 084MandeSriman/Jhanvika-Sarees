const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/apiResponse')
const { RecentlyViewed, Product, ProductImage } = require('../models')

// @route  POST /api/recently-viewed  { productId }
const track = asyncHandler(async (req, res) => {
  const { productId } = req.body
  const [record] = await RecentlyViewed.findOrCreate({
    where: { userId: req.user.id, productId },
    defaults: { viewedAt: new Date() },
  })
  record.viewedAt = new Date()
  await record.save()
  return ok(res, { tracked: true })
})

// @route  GET /api/recently-viewed
const list = asyncHandler(async (req, res) => {
  const rows = await RecentlyViewed.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images' }] }],
    order: [['viewedAt', 'DESC']],
    limit: 10,
  })
  return ok(res, rows.map((r) => r.product).filter(Boolean))
})

module.exports = { track, list }
