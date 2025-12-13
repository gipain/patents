const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  middleName: {
    type: DataTypes.STRING(100),
    field: 'middle_name'
  },
  email: {
    type: DataTypes.STRING(120)
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  orcid: {
    type: DataTypes.STRING(50)
  },
  scopusId: {
    type: DataTypes.STRING(50),
    field: 'scopus_id'
  },
  degree: {
    type: DataTypes.STRING(100)
  },
  title: {
    type: DataTypes.STRING(100)
  },
  specialization: {
    type: DataTypes.STRING(200)
  },
  biography: {
    type: DataTypes.TEXT
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
  tableName: 'authors',
  getterMethods: {
    fullName() {
      const parts = [this.lastName, this.firstName];
      if (this.middleName) parts.push(this.middleName);
      return parts.join(' ');
    }
  }
});

module.exports = Author;
