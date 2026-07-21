const express = require('express')
const ctrl = require('../controllers/searchController')

const router = express.Router()

router.get('/trending', ctrl.trending)

module.exports = router
