const express = require('express')
const ctrl = require('../controllers/bannerController')

const router = express.Router()

router.get('/', ctrl.listActiveBanners)

module.exports = router
