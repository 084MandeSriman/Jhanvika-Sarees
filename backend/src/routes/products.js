const express = require('express')
const ctrl = require('../controllers/productController')

const router = express.Router()

router.get('/', ctrl.listProducts)
router.get('/:slug', ctrl.getProductBySlug)
router.get('/:slug/related', ctrl.getRelatedProducts)

module.exports = router
