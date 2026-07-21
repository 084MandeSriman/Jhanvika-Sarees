const { ActivityLog } = require('../models')

async function recordActivity(req, action, details = {}) {
  try {
    await ActivityLog.create({
      userId: req.user ? req.user.id : null,
      action,
      details,
      ipAddress: req.ip,
    })
  } catch {
    // Auditing must never break the primary request.
  }
}

module.exports = { recordActivity }
