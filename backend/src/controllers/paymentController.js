const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const paymentService = require('../services/paymentService')
const { Order, OrderItem, Payment } = require('../models')

// @route  POST /api/payments/create-order
// Step 1 of the Razorpay flow: Cart -> Checkout -> [here] -> frontend popup.
const createOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body
  const order = await Order.findByPk(orderId)
  if (!order) return fail(res, 404, 'Order not found')
  if (req.user && order.userId && order.userId !== req.user.id) {
    return fail(res, 403, 'You do not have access to this order')
  }
  if (order.paymentStatus === 'paid') return fail(res, 400, 'This order has already been paid')

  const { razorpayOrder, payment } = await paymentService.initiatePayment(order)

  return created(res, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderNumber: order.orderNumber,
    paymentDbId: payment.id,
    // Sensible defaults for the Razorpay Checkout widget's "prefill"/branding.
    name: process.env.EMAIL_NAME || 'Jhanvika Sarees',
    description: `Order ${order.orderNumber}`,
  })
})

// @route  POST /api/payments/verify
// Step 2: frontend popup returns these three fields on success -> verify here.
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return fail(res, 400, 'Missing Razorpay verification fields')
  }

  try {
    const { order, payment } = await paymentService.verifyAndCapture({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
    return ok(res, { order, payment })
  } catch (err) {
    return fail(res, err.status || 400, err.message)
  }
})

// @route  POST /api/payments/failure
// Client-reported failure — e.g. the user closed the Razorpay modal or their card was declined.
const reportFailure = asyncHandler(async (req, res) => {
  const { razorpay_order_id: razorpayOrderId, reason } = req.body
  if (!razorpayOrderId) return fail(res, 400, 'Missing razorpay_order_id')

  try {
    const payment = await paymentService.markFailed({ razorpayOrderId, reason })
    return ok(res, { payment })
  } catch (err) {
    return fail(res, err.status || 400, err.message)
  }
})

// @route  GET /api/payments/history — customer's own payment history
const myHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 20)
  const { rows, count } = await paymentService.getHistoryForUser(req.user.id, { page, limit })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

// ---------- Admin ----------

// @route  GET /api/admin/payments
const adminListPayments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const { rows, count } = await paymentService.getHistoryForAdmin({ page, limit, status: req.query.status })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

// @route  GET /api/admin/payments/:id
const adminGetPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      { model: Order, as: 'order', include: [{ model: OrderItem, as: 'items' }] },
    ],
  })
  if (!payment) return fail(res, 404, 'Payment not found')
  return ok(res, payment)
})

module.exports = {
  createOrder,
  verifyPayment,
  reportFailure,
  myHistory,
  adminListPayments,
  adminGetPayment,
}
