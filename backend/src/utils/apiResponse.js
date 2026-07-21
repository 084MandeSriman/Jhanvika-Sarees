function ok(res, data, meta = undefined, status = 200) {
  return res.status(status).json({ success: true, data, meta })
}

function created(res, data) {
  return res.status(201).json({ success: true, data })
}

function fail(res, status, message, errors = undefined) {
  return res.status(status).json({ success: false, message, errors })
}

module.exports = { ok, created, fail }
