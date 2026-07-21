const express = require('express')
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/addressController')

const router = express.Router()

router.use(protect)
router.get('/', ctrl.listAddresses)
router.post('/', ctrl.createAddress)
router.put('/:id', ctrl.updateAddress)
router.delete('/:id', ctrl.deleteAddress)

module.exports = router
