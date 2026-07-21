const { validationResult } = require('express-validator')
const { fail } = require('../utils/apiResponse')

// Run after express-validator check(...) chains to short-circuit on bad input.
function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return fail(res, 422, 'Validation failed', errors.array())
  }
  next()
}

module.exports = validate
