const express = require('express')
const { body } = require('express-validator')
const validate = require('../middleware/validate')
const ctrl = require('../controllers/contactController')

const router = express.Router()

router.post(
  '/contact',
  [body('name').notEmpty(), body('email').isEmail(), body('message').notEmpty()],
  validate,
  ctrl.submitContactMessage
)

router.post('/newsletter/subscribe', [body('email').isEmail()], validate, ctrl.subscribeNewsletter)

module.exports = router
