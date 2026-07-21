const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const notificationService = require('../services/notificationService')
const invoiceService = require('../services/invoiceService')
const { sequelize, Order, OrderItem, OrderStatusHistory, Product, Coupon, User, Setting, Payment } = require('../models')

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `JHV${rand}`
}

// @route  POST /api/orders
// Body: { items: [{ productId, qty }], address, paymentMethod, couponCode }
// Prices are always recomputed server-side from the Product table — never trust client-sent prices.
const createOrder = asyncHandler(async (req, res) => {
  const { items, address, paymentMethod, couponCode } = req.body

  if (!items || items.length === 0) return fail(res, 400, 'Cart is empty')
  if (!address) return fail(res, 400, 'Shipping address is required')
  if (!['online', 'cod'].includes(paymentMethod)) return fail(res, 400, 'Invalid payment method')

  const result = await sequelize.transaction(async (t) => {
    let subtotal = 0
    const orderItemsData = []

    for (const line of items) {
      const product = await Product.findByPk(line.productId, { transaction: t, lock: t.LOCK.UPDATE })
      if (!product || product.status !== 'published') {
        throw new Error(`Product ${line.productId} is no longer available`)
      }
      if (product.stock < line.qty) {
        throw new Error(`Insufficient stock for ${product.name} (only ${product.stock} left)`)
      }
      const price = Number(product.price)
      subtotal += price * line.qty
      orderItemsData.push({ productId: product.id, name: product.name, price, qty: line.qty })
      product.stock -= line.qty
      await product.save({ transaction: t })
    }

    let discount = 0
    let appliedCouponCode = null
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: String(couponCode).toUpperCase(), isActive: true }, transaction: t })
      if (coupon && subtotal >= Number(coupon.minOrderValue) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date())) {
        discount = coupon.type === 'percent' ? Math.round((subtotal * Number(coupon.value)) / 100) : Number(coupon.value)
        discount = Math.min(discount, subtotal)
        appliedCouponCode = coupon.code
        coupon.usedCount += 1
        await coupon.save({ transaction: t })
      }
    }

    const [freeShippingSetting, flatFeeSetting, gstSetting] = await Promise.all([
      Setting.findByPk('free_shipping_threshold', { transaction: t }),
      Setting.findByPk('flat_shipping_fee', { transaction: t }),
      Setting.findByPk('gst_percent', { transaction: t }),
    ])
    const freeShippingThreshold = freeShippingSetting ? Number(freeShippingSetting.value) : 2999
    const flatShippingFee = flatFeeSetting ? Number(flatFeeSetting.value) : 149
    const shippingFee = subtotal - discount >= freeShippingThreshold ? 0 : flatShippingFee

    const gstPercent = gstSetting ? Number(gstSetting.value) : 0
    const taxableAmount = Math.max(subtotal - discount, 0)
    const tax = Math.round((taxableAmount * gstPercent) / 100)

    const total = taxableAmount + shippingFee + tax

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user ? req.user.id : null,
      guestEmail: req.user ? null : (address.email || null),
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      subtotal,
      tax,
      shippingFee,
      discount,
      total,
      couponCode: appliedCouponCode,
      shippingAddress: address,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }, { transaction: t })

    for (const item of orderItemsData) {
      await OrderItem.create({ orderId: order.id, ...item }, { transaction: t })
    }

    if (paymentMethod === 'cod') {
      // COD has no gateway step — the order is confirmed immediately and the
      // "payment" is collected in cash on delivery, so it stays pending.
      await Payment.create({
        orderId: order.id,
        userId: req.user ? req.user.id : null,
        amount: total,
        currency: 'INR',
        status: 'pending',
        paymentMethod: 'cod',
      }, { transaction: t })
      await OrderStatusHistory.create({ orderId: order.id, status: 'confirmed', note: 'Order placed — Cash on Delivery' }, { transaction: t })
    } else {
      await OrderStatusHistory.create({ orderId: order.id, status: 'pending', note: 'Order placed — awaiting online payment' }, { transaction: t })
    }

    return order
  })

  await recordActivity(req, 'order.create', { orderId: result.id })

  const full = await Order.findByPk(result.id, { include: [{ model: OrderItem, as: 'items' }] })

  if (paymentMethod === 'cod') {
    notificationService.notifyOrderConfirmed(full, req.user || null)
  }

  return created(res, full)
})

// @route  GET /api/orders/mine
const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['createdAt', 'DESC']],
  })
  return ok(res, orders)
})

// @route  GET /api/orders/:idOrNumber
const getOrder = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize')
  const order = await Order.findOne({
    where: { [Op.or]: [{ id: isNaN(req.params.id) ? -1 : req.params.id }, { orderNumber: req.params.id }] },
    include: [{ model: OrderItem, as: 'items' }, { model: OrderStatusHistory, as: 'statusHistory', order: [['createdAt', 'ASC']] }],
  })
  if (!order) return fail(res, 404, 'Order not found')
  if (req.user && order.userId && order.userId !== req.user.id && req.user.role === 'customer') {
    return fail(res, 403, 'You do not have access to this order')
  }
  return ok(res, order)
})

// @route  PUT /api/orders/:id/cancel  (customer-initiated cancellation)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id }, include: [{ model: OrderItem, as: 'items' }] })
  if (!order) return fail(res, 404, 'Order not found')
  if (!['pending', 'confirmed'].includes(order.status)) {
    return fail(res, 400, `Order cannot be cancelled once it is ${order.status}`)
  }
  order.status = 'cancelled'
  await order.save()
  await OrderStatusHistory.create({ orderId: order.id, status: 'cancelled', note: 'Cancelled by customer' })

  if (order.paymentStatus === 'paid') {
    // Marks the record for the admin's manual refund workflow — Razorpay
    // refunds still need to be triggered from the Razorpay dashboard/API by
    // someone with authority to move money; we don't auto-refund here.
    await Payment.update({ status: 'refunded' }, { where: { orderId: order.id, status: 'paid' } })
    order.paymentStatus = 'refunded'
    await order.save()
  }

  notificationService.notifyOrderCancelled(order, req.user)
  return ok(res, order)
})

// ---------- Admin ----------

// @route  GET /api/admin/orders
const adminListOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const offset = (page - 1) * limit
  const where = {}
  if (req.query.status) where.status = req.query.status
  if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: 'items' }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

// @route  PUT /api/admin/orders/:id/status  { status, note, courierName, trackingUrl }
const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, courierName, trackingUrl } = req.body
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }] })
  if (!order) return fail(res, 404, 'Order not found')

  order.status = status
  if (status === 'shipped') {
    if (!order.trackingNumber) order.trackingNumber = 'JHVTRK' + Math.floor(1000000 + Math.random() * 9000000)
    if (courierName) order.courierName = courierName
    if (trackingUrl) order.trackingUrl = trackingUrl
  }
  await order.save()
  await OrderStatusHistory.create({ orderId: order.id, status, note: note || `Status updated to ${status}` })
  await recordActivity(req, 'order.status_update', { orderId: order.id, status })

  const orderUser = order.userId ? await User.findByPk(order.userId) : null
  if (status === 'shipped') notificationService.notifyOrderShipped(order, orderUser)
  if (status === 'delivered') notificationService.notifyOrderDelivered(order, orderUser)
  if (status === 'cancelled') notificationService.notifyOrderCancelled(order, orderUser)

  return ok(res, order)
})

// @route  POST /api/admin/orders/:id/resend-email
const resendOrderEmail = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }] })
  if (!order) return fail(res, 404, 'Order not found')
  const orderUser = order.userId ? await User.findByPk(order.userId) : null
  await notificationService.notifyOrderConfirmed(order, orderUser)
  await recordActivity(req, 'order.resend_email', { orderId: order.id })
  return ok(res, { message: 'Order confirmation email resent' })
})

// @route  GET /api/orders/:id/invoice — downloads a PDF invoice
const downloadInvoice = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize')
  const order = await Order.findOne({
    where: { [Op.or]: [{ id: isNaN(req.params.id) ? -1 : req.params.id }, { orderNumber: req.params.id }] },
    include: [{ model: OrderItem, as: 'items' }],
  })
  if (!order) return fail(res, 404, 'Order not found')
  if (req.user && order.userId && order.userId !== req.user.id && req.user.role === 'customer') {
    return fail(res, 403, 'You do not have access to this order')
  }
  invoiceService.streamInvoice(order, res)
})

module.exports = {
  createOrder,
  myOrders,
  getOrder,
  cancelOrder,
  downloadInvoice,
  adminListOrders,
  adminUpdateOrderStatus,
  resendOrderEmail,
}
