const express = require('express')
const { protect, optionalAuth } = require('../middleware/auth')
const ctrl = require('../controllers/orderController')

const router = express.Router()

// Checkout is allowed for guests too (optionalAuth attaches req.user if logged in)
router.post('/', optionalAuth, ctrl.createOrder)
router.get('/mine', protect, ctrl.myOrders)
router.get('/:id', optionalAuth, ctrl.getOrder)
router.get('/:id/invoice', optionalAuth, ctrl.downloadInvoice)
router.put('/:id/cancel', protect, ctrl.cancelOrder)

module.exports = router
