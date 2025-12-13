const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  shortName: {
    type: DataTypes.STRING(100),
    field: 'short_name'
  },
  country: {
    type: DataTypes.STRING(100)
  },
  city: {
    type: DataTypes.STRING(100)
  },
  address: {
    type: DataTypes.TEXT
  },
  website: {
    type: DataTypes.STRING(200)
  },
  email: {
    type: DataTypes.STRING(120)
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'organizations'
});

module.exports = Organization;
