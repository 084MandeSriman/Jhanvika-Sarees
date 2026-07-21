const express = require('express')
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/recentlyViewedController')

const router = express.Router()

router.use(protect)
router.post('/', ctrl.track)
router.get('/', ctrl.list)

module.exports = router
