const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { Review, Product } = require('../models')

// @route  POST /api/products/:productId/reviews
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  const product = await Product.findByPk(req.params.productId)
  if (!product) return fail(res, 404, 'Product not found')

  const review = await Review.create({
    productId: product.id,
    userId: req.user.id,
    name: req.user.name,
    rating,
    comment,
    isApproved: false, // goes to moderation queue
  })
  return created(res, { message: 'Review submitted and pending approval', review })
})

// ---------- Admin ----------

const adminListReviews = asyncHandler(async (req, res) => {
  const where = {}
  if (req.query.status === 'pending') where.isApproved = false
  if (req.query.status === 'approved') where.isApproved = true
  const reviews = await Review.findAll({
    where,
    include: [{ model: Product, attributes: ['id', 'name', 'slug'] }],
    order: [['createdAt', 'DESC']],
  })
  return ok(res, reviews)
})

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id)
  if (!review) return fail(res, 404, 'Review not found')
  review.isApproved = true
  await review.save()

  const stats = await Review.findAll({ where: { productId: review.productId, isApproved: true }, raw: true })
  const count = stats.length
  const avg = count ? stats.reduce((s, r) => s + r.rating, 0) / count : 0
  await Product.update({ rating: avg.toFixed(1), reviewsCount: count }, { where: { id: review.productId } })

  await recordActivity(req, 'review.approve', { reviewId: review.id })
  return ok(res, review)
})

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id)
  if (!review) return fail(res, 404, 'Review not found')
  await review.destroy()
  await recordActivity(req, 'review.delete', { reviewId: req.params.id })
  return ok(res, { message: 'Review deleted' })
})

module.exports = { createReview, adminListReviews, approveReview, deleteReview }
