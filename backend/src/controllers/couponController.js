const { Op } = require('sequelize')
const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { Coupon } = require('../models')

// @route  POST /api/coupons/validate  { code, subtotal }
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body
  const coupon = await Coupon.findOne({ where: { code: String(code).toUpperCase(), isActive: true } })
  if (!coupon) return fail(res, 404, 'Invalid coupon code')
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return fail(res, 400, 'This coupon has expired')
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return fail(res, 400, 'This coupon has reached its usage limit')
  if (Number(subtotal) < Number(coupon.minOrderValue)) {
    return fail(res, 400, `Minimum order value for this coupon is ₹${coupon.minOrderValue}`)
  }

  const discount = coupon.type === 'percent'
    ? Math.round((Number(subtotal) * Number(coupon.value)) / 100)
    : Number(coupon.value)

  return ok(res, { code: coupon.code, type: coupon.type, value: Number(coupon.value), discount: Math.min(discount, Number(subtotal)) })
})

// ---------- Admin ----------

const adminListCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] })
  return ok(res, coupons)
})

const createCoupon = asyncHandler(async (req, res) => {
  const body = { ...req.body, code: String(req.body.code).toUpperCase() }
  const existing = await Coupon.findOne({ where: { code: body.code } })
  if (existing) return fail(res, 409, 'A coupon with this code already exists')
  const coupon = await Coupon.create(body)
  await recordActivity(req, 'coupon.create', { couponId: coupon.id })
  return created(res, coupon)
})

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id)
  if (!coupon) return fail(res, 404, 'Coupon not found')
  await coupon.update(req.body)
  await recordActivity(req, 'coupon.update', { couponId: coupon.id })
  return ok(res, coupon)
})

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id)
  if (!coupon) return fail(res, 404, 'Coupon not found')
  await coupon.destroy()
  await recordActivity(req, 'coupon.delete', { couponId: req.params.id })
  return ok(res, { message: 'Coupon deleted' })
})

module.exports = { validateCoupon, adminListCoupons, createCoupon, updateCoupon, deleteCoupon }
