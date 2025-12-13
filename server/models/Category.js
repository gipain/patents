const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  parentId: {
    type: DataTypes.INTEGER,
    field: 'parent_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'categories'
});

// Самозв'язок для підкатегорій
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = Category;
