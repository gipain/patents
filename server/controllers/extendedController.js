const { Bookmark, Note, Tag, Notification, Patent, Document, Author } = require('../models');

// === ЗАКЛАДКИ ===
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Додаємо інформацію про елементи
    const enrichedBookmarks = await Promise.all(bookmarks.map(async (bookmark) => {
      let item = null;
      if (bookmark.itemType === 'patent') {
        item = await Patent.findByPk(bookmark.itemId, {
          attributes: ['id', 'number', 'title']
        });
      } else if (bookmark.itemType === 'document') {
        item = await Document.findByPk(bookmark.itemId, {
          attributes: ['id', 'title', 'documentType']
        });
      } else if (bookmark.itemType === 'author') {
        item = await Author.findByPk(bookmark.itemId, {
          attributes: ['id', 'firstName', 'lastName', 'middleName']
        });
      }
      return {
        ...bookmark.toJSON(),
        item
      };
    }));

    res.json(enrichedBookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const { itemType, itemId, notes } = req.body;

    // Перевіряємо чи існує елемент
    let exists = false;
    if (itemType === 'patent') {
      exists = await Patent.findByPk(itemId);
    } else if (itemType === 'document') {
      exists = await Document.findByPk(itemId);
    } else if (itemType === 'author') {
      exists = await Author.findByPk(itemId);
    }

    if (!exists) {
      return res.status(404).json({ message: 'Елемент не знайдено' });
    }

    // Перевіряємо чи вже є закладка
    const existing = await Bookmark.findOne({
      where: { itemType, itemId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Закладка вже існує' });
    }

    const bookmark = await Bookmark.create({ itemType, itemId, notes });
    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findByPk(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Закладку не знайдено' });
    }
    await bookmark.destroy();
    res.json({ message: 'Закладку видалено' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// === НОТАТКИ ===
exports.getNotes = async (req, res) => {
  try {
    const { itemType, itemId } = req.query;
    const where = {};
    if (itemType) where.itemType = itemType;
    if (itemId) where.itemId = itemId;

    const notes = await Note.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Нотатку не знайдено' });
    }
    await note.update(req.body);
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Нотатку не знайдено' });
    }
    await note.destroy();
    res.json({ message: 'Нотатку видалено' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// === ТЕГИ ===
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']]
    });
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Тег не знайдено' });
    }
    await tag.destroy();
    res.json({ message: 'Тег видалено' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// === СПОВІЩЕННЯ ===
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const where = {};
    if (unreadOnly === 'true') where.isRead = false;

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Сповіщення не знайдено' });
    }
    await notification.update({ isRead: true });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { isRead: false } });
    res.json({ message: 'Всі сповіщення позначено як прочитані' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// === ЕКСПОРТ ===
exports.exportPatents = async (req, res) => {
  try {
    const { format = 'json', category, status } = req.query;
    const where = {};
    if (category) where.categoryId = category;
    if (status) where.status = status;

    const patents = await Patent.findAll({
      where,
      include: [
        { model: require('../models').Category, as: 'category' },
        { model: Author, as: 'authors' }
      ]
    });

    if (format === 'csv') {
      let csv = 'Номер;Назва;IPC;Дата публікації;Статус;Категорія;Автори\n';
      patents.forEach(p => {
        const authors = p.authors ? p.authors.map(a => `${a.lastName} ${a.firstName}`).join(', ') : '';
        csv += `"${p.number}";"${p.title}";"${p.ipcCode || ''}";"${p.publicationDate || ''}";"${p.status}";"${p.category?.name || ''}";"${authors}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=patents.csv');
      return res.send('\uFEFF' + csv);
    }

    if (format === 'bibtex') {
      let bibtex = '';
      patents.forEach(p => {
        const authors = p.authors ? p.authors.map(a => `${a.lastName}, ${a.firstName}`).join(' and ') : '';
        bibtex += `@patent{patent${p.id},\n`;
        bibtex += `  title = {${p.title}},\n`;
        bibtex += `  author = {${authors}},\n`;
        bibtex += `  number = {${p.number}},\n`;
        bibtex += `  year = {${p.publicationDate ? new Date(p.publicationDate).getFullYear() : ''}},\n`;
        bibtex += `  note = {IPC: ${p.ipcCode || 'N/A'}}\n`;
        bibtex += `}\n\n`;
      });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=patents.bib');
      return res.send(bibtex);
    }

    res.json(patents);
  } catch (error) {
    console.error('Error exporting patents:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

exports.exportDocuments = async (req, res) => {
  try {
    const { format = 'json', category, documentType } = req.query;
    const where = {};
    if (category) where.categoryId = category;
    if (documentType) where.documentType = documentType;

    const documents = await Document.findAll({
      where,
      include: [
        { model: require('../models').Category, as: 'category' },
        { model: Author, as: 'authors' }
      ]
    });

    if (format === 'csv') {
      let csv = 'Назва;Тип;Дата публікації;Журнал;DOI;Категорія;Автори\n';
      documents.forEach(d => {
        const authors = d.authors ? d.authors.map(a => `${a.lastName} ${a.firstName}`).join(', ') : '';
        csv += `"${d.title}";"${d.documentType}";"${d.publicationDate || ''}";"${d.journal || ''}";"${d.doi || ''}";"${d.category?.name || ''}";"${authors}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=documents.csv');
      return res.send('\uFEFF' + csv);
    }

    if (format === 'bibtex') {
      let bibtex = '';
      documents.forEach(d => {
        const authors = d.authors ? d.authors.map(a => `${a.lastName}, ${a.firstName}`).join(' and ') : '';
        const type = d.documentType === 'article' ? '@article' : '@misc';
        bibtex += `${type}{doc${d.id},\n`;
        bibtex += `  title = {${d.title}},\n`;
        bibtex += `  author = {${authors}},\n`;
        if (d.journal) bibtex += `  journal = {${d.journal}},\n`;
        if (d.volume) bibtex += `  volume = {${d.volume}},\n`;
        if (d.pages) bibtex += `  pages = {${d.pages}},\n`;
        bibtex += `  year = {${d.publicationDate ? new Date(d.publicationDate).getFullYear() : ''}}\n`;
        bibtex += `}\n\n`;
      });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=documents.bib');
      return res.send(bibtex);
    }

    res.json(documents);
  } catch (error) {
    console.error('Error exporting documents:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};
