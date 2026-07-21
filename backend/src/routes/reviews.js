const express = require('express')
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/reviewController')

const router = express.Router()

router.post('/:productId/reviews', protect, ctrl.createReview)

module.exports = router
