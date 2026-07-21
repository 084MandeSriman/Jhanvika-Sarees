const fs = require('fs')
const path = require('path')

const logDir = path.join(__dirname, '..', '..', 'logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

const errorLogPath = path.join(logDir, 'error.log')

function logError(err, context = {}) {
  const entry = `[${new Date().toISOString()}] ${err.stack || err.message}\nContext: ${JSON.stringify(context)}\n\n`
  fs.appendFile(errorLogPath, entry, () => {})
  // eslint-disable-next-line no-console
  console.error(entry)
}

module.exports = { logError }
