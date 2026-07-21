const slugify = require('slugify')
const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { Category, Product } = require('../models')

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ where: { isActive: true }, order: [['name', 'ASC']] })
  return ok(res, categories)
})

const createCategory = asyncHandler(async (req, res) => {
  const { name, tagline } = req.body
  const slug = slugify(name, { lower: true, strict: true })
  const existing = await Category.findOne({ where: { slug } })
  if (existing) return fail(res, 409, 'A category with this name already exists')
  const category = await Category.create({ name, slug, tagline })
  await recordActivity(req, 'category.create', { categoryId: category.id })
  return created(res, category)
})

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id)
  if (!category) return fail(res, 404, 'Category not found')
  await category.update(req.body)
  await recordActivity(req, 'category.update', { categoryId: category.id })
  return ok(res, category)
})

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id)
  if (!category) return fail(res, 404, 'Category not found')
  const productCount = await Product.count({ where: { categoryId: category.id } })
  if (productCount > 0) {
    await category.update({ isActive: false })
    await recordActivity(req, 'category.deactivate', { categoryId: category.id })
    return ok(res, { message: 'Category has products — deactivated instead of deleted' })
  }
  await category.destroy()
  await recordActivity(req, 'category.delete', { categoryId: category.id })
  return ok(res, { message: 'Category deleted' })
})

const uploadCategoryImage = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id)
  if (!category) return fail(res, 404, 'Category not found')
  if (!req.file) return fail(res, 400, 'No image file provided')

  await category.update({ imageUrl: `/uploads/${req.file.filename}` })
  await recordActivity(req, 'category.upload_image', { categoryId: category.id })
  return ok(res, category)
})

module.exports = { listCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage }
