const express = require('express')
const ctrl = require('../controllers/settingsController')

const router = express.Router()

router.get('/', ctrl.getPublicSettings)

module.exports = router
