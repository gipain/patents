const { Document, Author, Category, Tag, DocumentAuthor } = require('../models');
const { Op } = require('sequelize');

// Отримати всі документи
exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      documentType,
      year,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { abstract: { [Op.like]: `%${search}%` } },
        { keywords: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) where.categoryId = category;
    if (documentType) where.documentType = documentType;
    if (year) {
      where.publicationDate = {
        [Op.gte]: `${year}-01-01`,
        [Op.lte]: `${year}-12-31`
      };
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code'] },
        { model: Author, as: 'authors', attributes: ['id', 'firstName', 'lastName', 'middleName'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      documents: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримати документ за ID
exports.getById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Author, as: 'authors', include: [{ model: require('../models').Organization, as: 'organization' }] },
        { model: Tag, as: 'tags' }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    await document.increment('viewCount');

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Створити документ
exports.create = async (req, res) => {
  try {
    const { authors, tags, ...documentData } = req.body;

    const document = await Document.create(documentData);

    if (authors && authors.length > 0) {
      for (let i = 0; i < authors.length; i++) {
        await DocumentAuthor.create({
          documentId: document.id,
          authorId: authors[i],
          isMainAuthor: i === 0
        });
      }
    }

    if (tags && tags.length > 0) {
      await document.setTags(tags);
    }

    const result = await Document.findByPk(document.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Author, as: 'authors' },
        { model: Tag, as: 'tags' }
      ]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Оновити документ
exports.update = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    const { authors, tags, ...documentData } = req.body;

    await document.update(documentData);

    if (authors) {
      await DocumentAuthor.destroy({ where: { documentId: document.id } });
      for (let i = 0; i < authors.length; i++) {
        await DocumentAuthor.create({
          documentId: document.id,
          authorId: authors[i],
          isMainAuthor: i === 0
        });
      }
    }

    if (tags) {
      await document.setTags(tags);
    }

    const result = await Document.findByPk(document.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Author, as: 'authors' },
        { model: Tag, as: 'tags' }
      ]
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Видалити документ
exports.delete = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    await document.destroy();

    res.json({ message: 'Документ успішно видалено' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Статистика документів
exports.getStats = async (req, res) => {
  try {
    const totalDocuments = await Document.count();
    
    const byType = await Document.findAll({
      attributes: ['documentType', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['documentType']
    });

    const byYear = await Document.findAll({
      attributes: [
        [require('sequelize').fn('strftime', '%Y', require('sequelize').col('publication_date')), 'year'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: [require('sequelize').fn('strftime', '%Y', require('sequelize').col('publication_date'))],
      order: [[require('sequelize').literal('year'), 'DESC']],
      limit: 10
    });

    res.json({
      total: totalDocuments,
      byType,
      byYear
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};
