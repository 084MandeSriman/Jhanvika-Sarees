const express = require('express')
const ctrl = require('../../controllers/orderController')

const router = express.Router()

router.get('/', ctrl.adminListOrders)
router.put('/:id/status', ctrl.adminUpdateOrderStatus)
router.post('/:id/resend-email', ctrl.resendOrderEmail)

module.exports = router
