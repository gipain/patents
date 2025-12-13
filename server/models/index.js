const sequelize = require('../config/database');
const Category = require('./Category');
const Organization = require('./Organization');
const Author = require('./Author');
const Patent = require('./Patent');
const Document = require('./Document');
const { Bookmark, Note, Tag, SearchHistory, Notification } = require('./Extended');

// Зв'язки Author - Organization
Author.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Organization.hasMany(Author, { foreignKey: 'organizationId', as: 'authors' });

// Зв'язки Patent - Category
Patent.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Patent, { foreignKey: 'categoryId', as: 'patents' });

// Зв'язки Patent - Organization
Patent.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Organization.hasMany(Patent, { foreignKey: 'organizationId', as: 'patents' });

// Зв'язки Document - Category
Document.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Document, { foreignKey: 'categoryId', as: 'documents' });

// Many-to-Many: Patent - Author
const PatentAuthor = sequelize.define('PatentAuthor', {
  isMainAuthor: {
    type: require('sequelize').DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_main_author'
  }
}, { tableName: 'patent_authors', timestamps: false });

Patent.belongsToMany(Author, { through: PatentAuthor, foreignKey: 'patentId', as: 'authors' });
Author.belongsToMany(Patent, { through: PatentAuthor, foreignKey: 'authorId', as: 'patents' });

// Many-to-Many: Document - Author
const DocumentAuthor = sequelize.define('DocumentAuthor', {
  isMainAuthor: {
    type: require('sequelize').DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_main_author'
  }
}, { tableName: 'document_authors', timestamps: false });

Document.belongsToMany(Author, { through: DocumentAuthor, foreignKey: 'documentId', as: 'authors' });
Author.belongsToMany(Document, { through: DocumentAuthor, foreignKey: 'authorId', as: 'documents' });

// Many-to-Many: Patent - Tag
const PatentTag = sequelize.define('PatentTag', {}, { tableName: 'patent_tags', timestamps: false });
Patent.belongsToMany(Tag, { through: PatentTag, foreignKey: 'patentId', as: 'tags' });
Tag.belongsToMany(Patent, { through: PatentTag, foreignKey: 'tagId', as: 'patents' });

// Many-to-Many: Document - Tag
const DocumentTag = sequelize.define('DocumentTag', {}, { tableName: 'document_tags', timestamps: false });
Document.belongsToMany(Tag, { through: DocumentTag, foreignKey: 'documentId', as: 'tags' });
Tag.belongsToMany(Document, { through: DocumentTag, foreignKey: 'tagId', as: 'documents' });

// Цитування патентів
const PatentCitation = sequelize.define('PatentCitation', {
  id: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, { tableName: 'patent_citations', timestamps: true });

Patent.belongsToMany(Patent, { 
  through: PatentCitation, 
  as: 'citedPatents', 
  foreignKey: 'citingPatentId',
  otherKey: 'citedPatentId'
});

Patent.belongsToMany(Patent, { 
  through: PatentCitation, 
  as: 'citingPatents', 
  foreignKey: 'citedPatentId',
  otherKey: 'citingPatentId'
});

module.exports = {
  sequelize,
  Category,
  Organization,
  Author,
  Patent,
  Document,
  Bookmark,
  Note,
  Tag,
  SearchHistory,
  Notification,
  PatentAuthor,
  DocumentAuthor,
  PatentTag,
  DocumentTag,
  PatentCitation
};
