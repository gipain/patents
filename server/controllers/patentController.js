const { Patent, Author, Category, Organization, Tag, PatentAuthor } = require('../models');
const { Op } = require('sequelize');

// Отримати всі патенти з фільтрами та пагінацією
exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status, 
      patentType,
      year,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { number: { [Op.like]: `%${search}%` } },
        { abstract: { [Op.like]: `%${search}%` } },
        { keywords: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) where.categoryId = category;
    if (status) where.status = status;
    if (patentType) where.patentType = patentType;
    if (year) {
      where.publicationDate = {
        [Op.gte]: `${year}-01-01`,
        [Op.lte]: `${year}-12-31`
      };
    }

    const { count, rows } = await Patent.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code'] },
        { model: Organization, as: 'organization', attributes: ['id', 'name', 'shortName'] },
        { model: Author, as: 'authors', attributes: ['id', 'firstName', 'lastName', 'middleName'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      patents: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patents:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримати патент за ID
exports.getById = async (req, res) => {
  try {
    const patent = await Patent.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Organization, as: 'organization' },
        { model: Author, as: 'authors', include: [{ model: Organization, as: 'organization' }] },
        { model: Tag, as: 'tags' },
        { model: Patent, as: 'citedPatents', attributes: ['id', 'number', 'title'] },
        { model: Patent, as: 'citingPatents', attributes: ['id', 'number', 'title'] }
      ]
    });

    if (!patent) {
      return res.status(404).json({ message: 'Патент не знайдено' });
    }

    // Збільшуємо лічильник переглядів
    await patent.increment('viewCount');

    res.json(patent);
  } catch (error) {
    console.error('Error fetching patent:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Створити патент
exports.create = async (req, res) => {
  try {
    const { authors, tags, ...patentData } = req.body;

    const patent = await Patent.create(patentData);

    // Додаємо авторів
    if (authors && authors.length > 0) {
      for (let i = 0; i < authors.length; i++) {
        await PatentAuthor.create({
          patentId: patent.id,
          authorId: authors[i],
          isMainAuthor: i === 0
        });
      }
    }

    // Додаємо теги
    if (tags && tags.length > 0) {
      await patent.setTags(tags);
    }

    const result = await Patent.findByPk(patent.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Author, as: 'authors' },
        { model: Tag, as: 'tags' }
      ]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating patent:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Оновити патент
exports.update = async (req, res) => {
  try {
    const patent = await Patent.findByPk(req.params.id);

    if (!patent) {
      return res.status(404).json({ message: 'Патент не знайдено' });
    }

    const { authors, tags, ...patentData } = req.body;

    await patent.update(patentData);

    // Оновлюємо авторів
    if (authors) {
      await PatentAuthor.destroy({ where: { patentId: patent.id } });
      for (let i = 0; i < authors.length; i++) {
        await PatentAuthor.create({
          patentId: patent.id,
          authorId: authors[i],
          isMainAuthor: i === 0
        });
      }
    }

    // Оновлюємо теги
    if (tags) {
      await patent.setTags(tags);
    }

    const result = await Patent.findByPk(patent.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Author, as: 'authors' },
        { model: Tag, as: 'tags' }
      ]
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating patent:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Видалити патент
exports.delete = async (req, res) => {
  try {
    const patent = await Patent.findByPk(req.params.id);

    if (!patent) {
      return res.status(404).json({ message: 'Патент не знайдено' });
    }

    await patent.destroy();

    res.json({ message: 'Патент успішно видалено' });
  } catch (error) {
    console.error('Error deleting patent:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримати статистику патентів
exports.getStats = async (req, res) => {
  try {
    const totalPatents = await Patent.count();
    
    const byStatus = await Patent.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['status']
    });

    const byType = await Patent.findAll({
      attributes: ['patentType', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['patentType']
    });

    const byYear = await Patent.findAll({
      attributes: [
        [require('sequelize').fn('strftime', '%Y', require('sequelize').col('publication_date')), 'year'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: [require('sequelize').fn('strftime', '%Y', require('sequelize').col('publication_date'))],
      order: [[require('sequelize').literal('year'), 'DESC']],
      limit: 10
    });

    res.json({
      total: totalPatents,
      byStatus,
      byType,
      byYear
    });
  } catch (error) {
    console.error('Error fetching patent stats:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};
