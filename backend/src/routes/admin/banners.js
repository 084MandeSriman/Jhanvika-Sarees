const express = require('express')
const ctrl = require('../../controllers/bannerController')

const router = express.Router()

router.get('/', ctrl.adminListBanners)
router.post('/', ctrl.createBanner)
router.put('/:id', ctrl.updateBanner)
router.delete('/:id', ctrl.deleteBanner)

module.exports = router
