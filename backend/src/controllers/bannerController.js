const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { Banner } = require('../models')

const listActiveBanners = asyncHandler(async (req, res) => {
  const where = { isActive: true }
  if (req.query.position) where.position = req.query.position
  const banners = await Banner.findAll({ where, order: [['sortOrder', 'ASC']] })
  return ok(res, banners)
})

const adminListBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.findAll({ order: [['sortOrder', 'ASC']] })
  return ok(res, banners)
})

const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body)
  await recordActivity(req, 'banner.create', { bannerId: banner.id })
  return created(res, banner)
})

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id)
  if (!banner) return fail(res, 404, 'Banner not found')
  await banner.update(req.body)
  await recordActivity(req, 'banner.update', { bannerId: banner.id })
  return ok(res, banner)
})

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id)
  if (!banner) return fail(res, 404, 'Banner not found')
  await banner.destroy()
  await recordActivity(req, 'banner.delete', { bannerId: req.params.id })
  return ok(res, { message: 'Banner deleted' })
})

module.exports = { listActiveBanners, adminListBanners, createBanner, updateBanner, deleteBanner }
