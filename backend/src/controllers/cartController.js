const asyncHandler = require('../utils/asyncHandler')
const { ok, fail } = require('../utils/apiResponse')
const { Cart, CartItem, Product, ProductImage } = require('../models')

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ where: { userId } })
  if (!cart) cart = await Cart.create({ userId })
  return cart
}

const includeOpts = [
  { model: CartItem, as: 'items', include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images' }] }] },
]

// @route  GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

// @route  POST /api/cart/items  { productId, qty }
const addItem = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body
  const product = await Product.findByPk(productId)
  if (!product) return fail(res, 404, 'Product not found')

  const cart = await getOrCreateCart(req.user.id)
  let item = await CartItem.findOne({ where: { cartId: cart.id, productId } })
  if (item) {
    item.qty += Number(qty)
    await item.save()
  } else {
    item = await CartItem.create({ cartId: cart.id, productId, qty })
  }
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

// @route  PUT /api/cart/items/:itemId  { qty }
const updateItem = asyncHandler(async (req, res) => {
  const { qty } = req.body
  const cart = await getOrCreateCart(req.user.id)
  const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } })
  if (!item) return fail(res, 404, 'Cart item not found')
  if (qty < 1) await item.destroy()
  else { item.qty = qty; await item.save() }
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

// @route  DELETE /api/cart/items/:itemId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } })
  if (!item) return fail(res, 404, 'Cart item not found')
  await item.destroy()
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

// @route  POST /api/cart/merge  { items: [{ productId, qty }] }
// Merges a guest's localStorage cart into the server cart right after login/register.
const mergeCart = asyncHandler(async (req, res) => {
  const { items = [] } = req.body
  const cart = await getOrCreateCart(req.user.id)
  for (const guestItem of items) {
    const product = await Product.findByPk(guestItem.productId)
    if (!product) continue
    const existing = await CartItem.findOne({ where: { cartId: cart.id, productId: guestItem.productId } })
    if (existing) {
      existing.qty += Number(guestItem.qty || 1)
      await existing.save()
    } else {
      await CartItem.create({ cartId: cart.id, productId: guestItem.productId, qty: guestItem.qty || 1 })
    }
  }
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

// @route  DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  await CartItem.destroy({ where: { cartId: cart.id } })
  return ok(res, { message: 'Cart cleared' })
})

// @route  PUT /api/cart/items/:itemId/save-for-later
const saveForLater = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } })
  if (!item) return fail(res, 404, 'Cart item not found')
  item.savedForLater = true
  await item.save()
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

// @route  PUT /api/cart/items/:itemId/move-to-cart
const moveToCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id)
  const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } })
  if (!item) return fail(res, 404, 'Cart item not found')
  item.savedForLater = false
  await item.save()
  const full = await Cart.findByPk(cart.id, { include: includeOpts })
  return ok(res, full)
})

module.exports = { getCart, addItem, updateItem, removeItem, mergeCart, clearCart, saveForLater, moveToCart }
