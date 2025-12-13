const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patent = sequelize.define('Patent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  abstract: {
    type: DataTypes.TEXT
  },
  description: {
    type: DataTypes.TEXT
  },
  claims: {
    type: DataTypes.TEXT
  },
  ipcCode: {
    type: DataTypes.STRING(100),
    field: 'ipc_code'
  },
  filingDate: {
    type: DataTypes.DATEONLY,
    field: 'filing_date'
  },
  publicationDate: {
    type: DataTypes.DATEONLY,
    field: 'publication_date'
  },
  grantDate: {
    type: DataTypes.DATEONLY,
    field: 'grant_date'
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    field: 'expiration_date'
  },
  status: {
    type: DataTypes.ENUM('pending', 'granted', 'expired', 'rejected'),
    defaultValue: 'pending'
  },
  patentType: {
    type: DataTypes.ENUM('invention', 'utility_model', 'design'),
    defaultValue: 'invention',
    field: 'patent_type'
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Україна'
  },
  applicant: {
    type: DataTypes.STRING(300)
  },
  keywords: {
    type: DataTypes.TEXT
  },
  priorityNumber: {
    type: DataTypes.STRING(100),
    field: 'priority_number'
  },
  priorityDate: {
    type: DataTypes.DATEONLY,
    field: 'priority_date'
  },
  priorityCountry: {
    type: DataTypes.STRING(100),
    field: 'priority_country'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.INTEGER,
    field: 'organization_id',
    references: {
      model: 'organizations',
      key: 'id'
    }
  }
}, {
  tableName: 'patents'
});

module.exports = Patent;
