const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  abstract: {
    type: DataTypes.TEXT
  },
  content: {
    type: DataTypes.TEXT
  },
  documentType: {
    type: DataTypes.ENUM('article', 'thesis', 'report', 'monograph', 'conference', 'book', 'manual', 'standard'),
    defaultValue: 'article',
    field: 'document_type'
  },
  publicationDate: {
    type: DataTypes.DATEONLY,
    field: 'publication_date'
  },
  publisher: {
    type: DataTypes.STRING(200)
  },
  journal: {
    type: DataTypes.STRING(200)
  },
  volume: {
    type: DataTypes.STRING(50)
  },
  issue: {
    type: DataTypes.STRING(50)
  },
  pages: {
    type: DataTypes.STRING(50)
  },
  doi: {
    type: DataTypes.STRING(100)
  },
  isbn: {
    type: DataTypes.STRING(50)
  },
  issn: {
    type: DataTypes.STRING(50)
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'Українська'
  },
  keywords: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.STRING(500)
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'download_count'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'documents'
});

module.exports = Document;
