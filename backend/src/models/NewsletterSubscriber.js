const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
})

module.exports = NewsletterSubscriber
