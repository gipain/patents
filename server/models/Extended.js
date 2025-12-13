const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Закладки
const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemType: {
    type: DataTypes.ENUM('patent', 'document', 'author'),
    allowNull: false,
    field: 'item_type'
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'item_id'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'bookmarks'
});

// Нотатки
const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemType: {
    type: DataTypes.ENUM('patent', 'document'),
    allowNull: false,
    field: 'item_type'
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'item_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'notes'
});

// Теги
const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#3b82f6'
  }
}, {
  tableName: 'tags'
});

// Історія пошуку
const SearchHistory = sequelize.define('SearchHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  query: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  searchType: {
    type: DataTypes.STRING(50),
    defaultValue: 'global',
    field: 'search_type'
  },
  resultsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'results_count'
  },
  filters: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'search_history'
});

// Сповіщення
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT
  },
  notificationType: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    defaultValue: 'info',
    field: 'notification_type'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  }
}, {
  tableName: 'notifications'
});

module.exports = { Bookmark, Note, Tag, SearchHistory, Notification };
