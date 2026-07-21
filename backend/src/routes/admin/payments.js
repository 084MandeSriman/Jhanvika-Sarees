const express = require('express')
const ctrl = require('../../controllers/paymentController')

const router = express.Router()

router.get('/', ctrl.adminListPayments)
router.get('/:id', ctrl.adminGetPayment)

module.exports = router
