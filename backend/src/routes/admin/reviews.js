const express = require('express')
const ctrl = require('../../controllers/reviewController')

const router = express.Router()

router.get('/', ctrl.adminListReviews)
router.put('/:id/approve', ctrl.approveReview)
router.delete('/:id', ctrl.deleteReview)

module.exports = router
