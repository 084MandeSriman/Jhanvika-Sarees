const { Op } = require('sequelize')
const slugify = require('slugify')
const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { Product, Category, ProductImage, Review } = require('../models')

// @route  GET /api/products
// Supports: page, limit, category, minPrice, maxPrice, search, sort, bestseller, isNew
const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(48, parseInt(req.query.limit) || 12)
  const offset = (page - 1) * limit

  const where = { status: 'published' }
  if (req.query.category) {
    const cat = await Category.findOne({ where: { slug: req.query.category } })
    if (cat) where.categoryId = cat.id
    else where.categoryId = -1 // no match
  }
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {}
    if (req.query.minPrice) where.price[Op.gte] = Number(req.query.minPrice)
    if (req.query.maxPrice) where.price[Op.lte] = Number(req.query.maxPrice)
  }
  if (req.query.search) {
    where.name = { [Op.like]: `%${req.query.search}%` }
  }
  if (req.query.bestseller === 'true') where.bestseller = true
  if (req.query.isNew === 'true') where.isNew = true
  if (req.query.ids) {
    const idList = String(req.query.ids).split(',').map((v) => Number(v)).filter(Boolean)
    where.id = { [Op.in]: idList.length ? idList : [-1] }
  }

  let order = [['createdAt', 'DESC']]
  switch (req.query.sort) {
    case 'price-asc': order = [['price', 'ASC']]; break
    case 'price-desc': order = [['price', 'DESC']]; break
    case 'rating': order = [['rating', 'DESC']]; break
    case 'bestseller': order = [['bestseller', 'DESC']]; break
    default: break
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: ProductImage, as: 'images', attributes: ['id', 'url', 'altText', 'sortOrder'] },
    ],
    order,
    limit,
    offset,
    distinct: true,
  })

  if (req.query.search) {
    const { SearchLog } = require('../models')
    SearchLog.create({
      query: req.query.search,
      resultsCount: count,
      userId: req.user ? req.user.id : null,
    }).catch(() => {})
  }

  return ok(res, rows, {
    page, limit, total: count, totalPages: Math.ceil(count / limit),
  })
})

// @route  GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: Category, as: 'category' },
      { model: ProductImage, as: 'images' },
      { model: Review, as: 'productReviews', where: { isApproved: true }, required: false },
    ],
  })
  if (!product) return fail(res, 404, 'Product not found')
  return ok(res, product)
})

// @route  GET /api/products/:slug/related
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } })
  if (!product) return fail(res, 404, 'Product not found')
  const related = await Product.findAll({
    where: { categoryId: product.categoryId, id: { [Op.ne]: product.id }, status: 'published' },
    include: [{ model: ProductImage, as: 'images' }],
    limit: 4,
  })
  return ok(res, related)
})

// ---------- Admin ----------

// @route  POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const body = req.body
  const slug = slugify(body.name, { lower: true, strict: true }) + '-' + Date.now().toString(36)
  const product = await Product.create({ ...body, slug })
  await recordActivity(req, 'product.create', { productId: product.id })
  return created(res, product)
})

// @route  PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id)
  if (!product) return fail(res, 404, 'Product not found')
  await product.update(req.body)
  await recordActivity(req, 'product.update', { productId: product.id })
  return ok(res, product)
})

// @route  DELETE /api/admin/products/:id  (soft delete via status=archived)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id)
  if (!product) return fail(res, 404, 'Product not found')
  await product.update({ status: 'archived' })
  await recordActivity(req, 'product.archive', { productId: product.id })
  return ok(res, { message: 'Product archived (soft delete)' })
})

// @route  POST /api/admin/products/:id/restore
const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id)
  if (!product) return fail(res, 404, 'Product not found')
  await product.update({ status: 'published' })
  await recordActivity(req, 'product.restore', { productId: product.id })
  return ok(res, product)
})

// @route  GET /api/admin/products  (includes drafts/archived, no status filter)
const adminListProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const offset = (page - 1) * limit
  const where = {}
  if (req.query.status) where.status = req.query.status
  if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [{ model: Category, as: 'category' }, { model: ProductImage, as: 'images' }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

// @route  POST /api/admin/products/:id/images  (multipart upload)
const uploadProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id)
  if (!product) return fail(res, 404, 'Product not found')
  if (!req.file) return fail(res, 400, 'No image file provided')

  const count = await ProductImage.count({ where: { productId: product.id } })
  const image = await ProductImage.create({
    productId: product.id,
    url: `/uploads/${req.file.filename}`,
    altText: req.body.altText || product.name,
    sortOrder: count,
  })
  return created(res, image)
})

// @route  DELETE /api/admin/products/:id/images/:imageId
const deleteProductImage = asyncHandler(async (req, res) => {
  const image = await ProductImage.findOne({ where: { id: req.params.imageId, productId: req.params.id } })
  if (!image) return fail(res, 404, 'Image not found')
  await image.destroy()
  return ok(res, { message: 'Image removed' })
})

module.exports = {
  listProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  adminListProducts,
  uploadProductImage,
  deleteProductImage,
}
