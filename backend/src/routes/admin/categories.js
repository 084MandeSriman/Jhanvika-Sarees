const express = require('express')
const upload = require('../../middleware/upload')
const ctrl = require('../../controllers/categoryController')

const router = express.Router()

router.post('/', ctrl.createCategory)
router.put('/:id', ctrl.updateCategory)
router.post('/:id/image', upload.single('image'), ctrl.uploadCategoryImage)
router.delete('/:id', ctrl.deleteCategory)

module.exports = router
