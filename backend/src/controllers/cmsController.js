const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { CmsPage } = require('../models')

const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOne({ where: { slug: req.params.slug } })
  if (!page) return fail(res, 404, 'Page not found')
  return ok(res, page)
})

const adminListPages = asyncHandler(async (req, res) => {
  const pages = await CmsPage.findAll({ order: [['title', 'ASC']] })
  return ok(res, pages)
})

const createPage = asyncHandler(async (req, res) => {
  const existing = await CmsPage.findOne({ where: { slug: req.body.slug } })
  if (existing) return fail(res, 409, 'A page with this slug already exists')
  const page = await CmsPage.create(req.body)
  await recordActivity(req, 'cms.create', { pageId: page.id })
  return created(res, page)
})

const updatePage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findByPk(req.params.id)
  if (!page) return fail(res, 404, 'Page not found')
  await page.update(req.body)
  await recordActivity(req, 'cms.update', { pageId: page.id })
  return ok(res, page)
})

const deletePage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findByPk(req.params.id)
  if (!page) return fail(res, 404, 'Page not found')
  await page.destroy()
  await recordActivity(req, 'cms.delete', { pageId: req.params.id })
  return ok(res, { message: 'Page deleted' })
})

module.exports = { getPageBySlug, adminListPages, createPage, updatePage, deletePage }
