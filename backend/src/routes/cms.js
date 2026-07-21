const express = require('express')
const ctrl = require('../controllers/cmsController')

const router = express.Router()

router.get('/:slug', ctrl.getPageBySlug)

module.exports = router
