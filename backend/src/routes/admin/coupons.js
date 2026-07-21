const express = require('express')
const ctrl = require('../../controllers/couponController')

const router = express.Router()

router.get('/', ctrl.adminListCoupons)
router.post('/', ctrl.createCoupon)
router.put('/:id', ctrl.updateCoupon)
router.delete('/:id', ctrl.deleteCoupon)

module.exports = router
