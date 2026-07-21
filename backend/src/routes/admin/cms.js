const express = require('express')
const ctrl = require('../../controllers/cmsController')

const router = express.Router()

router.get('/', ctrl.adminListPages)
router.post('/', ctrl.createPage)
router.put('/:id', ctrl.updatePage)
router.delete('/:id', ctrl.deletePage)

module.exports = router
