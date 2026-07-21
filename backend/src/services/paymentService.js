const razorpayService = require('./razorpayService')
const notificationService = require('./notificationService')
const { sequelize, Order, OrderItem, OrderStatusHistory, Payment, User } = require('../models')

/**
 * Step 1 of the flow: Cart -> Checkout -> [Create Razorpay Order].
 * Creates a Razorpay order for an existing (already-created, still-pending)
 * Jhanvika Order, and a matching `pending` Payment row to track it.
 */
async function initiatePayment(order) {
  const razorpayOrder = await razorpayService.createRazorpayOrder({
    amount: Number(order.total) * 100, // rupees -> paise
    currency: 'INR',
    receipt: order.orderNumber,
    notes: { orderId: String(order.id), orderNumber: order.orderNumber },
  })

  const payment = await Payment.create({
    orderId: order.id,
    userId: order.userId,
    razorpayOrderId: razorpayOrder.id,
    amount: order.total,
    currency: 'INR',
    status: 'pending',
    paymentMethod: 'online',
  })

  return { razorpayOrder, payment }
}

/**
 * Step 2: [Frontend Razorpay Popup] -> Payment Success -> here.
 * Verifies the signature, and only on success marks the Payment `paid` and
 * the Order `confirmed`/`paid` inside one transaction, then fires
 * confirmation emails. This is the ONLY code path that should ever mark an
 * online order as paid.
 */
async function verifyAndCapture({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const isValid = razorpayService.verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })

  const payment = await Payment.findOne({ where: { razorpayOrderId } })
  if (!payment) throw Object.assign(new Error('Payment record not found for this Razorpay order'), { status: 404 })

  if (!isValid) {
    payment.status = 'failed'
    payment.rawPayload = { reason: 'signature_mismatch' }
    await payment.save()
    const order = await Order.findByPk(payment.orderId)
    if (order) {
      order.paymentStatus = 'failed'
      await order.save()
    }
    throw Object.assign(new Error('Payment signature verification failed'), { status: 400 })
  }

  const result = await sequelize.transaction(async (t) => {
    payment.razorpayPaymentId = razorpayPaymentId
    payment.razorpaySignature = razorpaySignature
    payment.status = 'paid'
    await payment.save({ transaction: t })

    const order = await Order.findByPk(payment.orderId, { transaction: t })
    order.paymentStatus = 'paid'
    order.status = 'confirmed'
    await order.save({ transaction: t })
    await OrderStatusHistory.create({ orderId: order.id, status: 'confirmed', note: 'Payment received via Razorpay' }, { transaction: t })

    return { order, payment }
  })

  const fullOrder = await Order.findByPk(result.order.id, { include: [{ model: OrderItem, as: 'items' }] })
  const user = payment.userId ? await User.findByPk(payment.userId) : null

  notificationService.notifyOrderConfirmed(fullOrder, user)
  notificationService.notifyPaymentSuccess(fullOrder, result.payment, user)

  return { order: fullOrder, payment: result.payment }
}

/**
 * Client-reported failure (user closed the Razorpay modal, card declined,
 * etc). No signature to verify here since no payment succeeded — this just
 * records the failure and notifies the customer so they know to retry.
 */
async function markFailed({ razorpayOrderId, reason }) {
  const payment = await Payment.findOne({ where: { razorpayOrderId } })
  if (!payment) throw Object.assign(new Error('Payment record not found for this Razorpay order'), { status: 404 })

  payment.status = 'failed'
  payment.rawPayload = { reason: reason || 'client_reported_failure' }
  await payment.save()

  const order = await Order.findByPk(payment.orderId, { include: [{ model: OrderItem, as: 'items' }] })
  if (order) {
    order.paymentStatus = 'failed'
    await order.save()
  }

  const user = payment.userId ? await User.findByPk(payment.userId) : null
  notificationService.notifyPaymentFailed(order, user)

  return payment
}

async function getHistoryForUser(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  const { rows, count } = await Payment.findAndCountAll({
    where: { userId },
    include: [{ model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status', 'total'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return { rows, count }
}

async function getHistoryForAdmin({ page = 1, limit = 20, status } = {}) {
  const offset = (page - 1) * limit
  const where = {}
  if (status) where.status = status
  const { rows, count } = await Payment.findAndCountAll({
    where,
    include: [
      { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return { rows, count }
}

module.exports = { initiatePayment, verifyAndCapture, markFailed, getHistoryForUser, getHistoryForAdmin }
