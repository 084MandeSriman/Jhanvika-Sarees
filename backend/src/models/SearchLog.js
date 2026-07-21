const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const SearchLog = sequelize.define('SearchLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  query: { type: DataTypes.STRING, allowNull: false },
  resultsCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'results_count' },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
}, {
  indexes: [{ fields: ['query'] }],
})

module.exports = SearchLog
