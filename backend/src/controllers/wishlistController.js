const asyncHandler = require('../utils/asyncHandler')
const { ok, fail } = require('../utils/apiResponse')
const { Wishlist, Product, ProductImage } = require('../models')

const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images' }] }],
  })
  return ok(res, items)
})

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body
  const product = await Product.findByPk(productId)
  if (!product) return fail(res, 404, 'Product not found')

  const existing = await Wishlist.findOne({ where: { userId: req.user.id, productId } })
  if (existing) {
    await existing.destroy()
    return ok(res, { wished: false })
  }
  await Wishlist.create({ userId: req.user.id, productId })
  return ok(res, { wished: true })
})

module.exports = { getWishlist, toggleWishlist }
