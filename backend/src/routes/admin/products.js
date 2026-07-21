const express = require('express')
const upload = require('../../middleware/upload')
const ctrl = require('../../controllers/productController')

const router = express.Router()

router.get('/', ctrl.adminListProducts)
router.post('/', ctrl.createProduct)
router.put('/:id', ctrl.updateProduct)
router.delete('/:id', ctrl.deleteProduct)
router.post('/:id/restore', ctrl.restoreProduct)
router.post('/:id/images', upload.single('image'), ctrl.uploadProductImage)
router.delete('/:id/images/:imageId', ctrl.deleteProductImage)

module.exports = router
