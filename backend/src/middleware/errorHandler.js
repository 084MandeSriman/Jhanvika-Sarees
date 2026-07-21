const { fail } = require('../utils/apiResponse')
const { logError } = require('../utils/logger')

function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Route not found — ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  logError(err, { method: req.method, url: req.originalUrl, body: req.body })
  fail(res, status, err.message || 'Internal server error',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined)
}

module.exports = { notFound, errorHandler }
