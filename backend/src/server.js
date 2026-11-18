require('dotenv').config()
const app = require('./app')
const { sequelize } = require('./models')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    console.log('DB_HOST:', process.env.DB_HOST)
    console.log('DB_PORT:', process.env.DB_PORT)
    console.log('DB_NAME:', process.env.DB_NAME)
    console.log('DB_USER:', process.env.DB_USER)
    await sequelize.authenticate()
    console.log('✅ MySQL connection established')

    // Avoid alter sync: MySQL can accumulate duplicate indexes for unique fields.
    // Use migrations for changes to existing tables.
    await sequelize.sync()
    console.log('✅ Database schema synced')

    app.listen(PORT, () => {
      console.log(`🚀 Jhanvika API running on http://localhost:${PORT}`)
      console.log(`   Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error('❌ Unable to start server:', err.message)
    console.error('   Check your MySQL connection settings in backend/.env')
    process.exit(1)
  }
}

start()
