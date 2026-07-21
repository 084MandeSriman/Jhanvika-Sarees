const express = require('express')
const ctrl = require('../controllers/couponController')

const router = express.Router()

router.post('/validate', ctrl.validateCoupon)

module.exports = router
