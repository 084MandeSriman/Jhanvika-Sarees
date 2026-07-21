const express = require('express')
const { protect, optionalAuth } = require('../middleware/auth')
const ctrl = require('../controllers/paymentController')

const router = express.Router()

// Guest checkout can still pay online, so these use optionalAuth like /api/orders.
router.post('/create-order', optionalAuth, ctrl.createOrder)
router.post('/verify', optionalAuth, ctrl.verifyPayment)
router.post('/failure', optionalAuth, ctrl.reportFailure)

router.get('/history', protect, ctrl.myHistory)

module.exports = router
