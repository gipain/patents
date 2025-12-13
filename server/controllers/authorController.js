const { Author, Organization, Patent, Document } = require('../models');
const { Op } = require('sequelize');

// Отримати всіх авторів
exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      organization,
      sortBy = 'lastName',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { middleName: { [Op.like]: `%${search}%` } },
        { specialization: { [Op.like]: `%${search}%` } }
      ];
    }

    if (organization) where.organizationId = organization;

    const { count, rows } = await Author.findAndCountAll({
      where,
      include: [
        { model: Organization, as: 'organization', attributes: ['id', 'name', 'shortName'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Додаємо кількість патентів і документів для кожного автора
    const authorsWithCounts = await Promise.all(rows.map(async (author) => {
      const patentsCount = await author.countPatents();
      const documentsCount = await author.countDocuments();
      return {
        ...author.toJSON(),
        patentsCount,
        documentsCount
      };
    }));

    res.json({
      authors: authorsWithCounts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримати автора за ID
exports.getById = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [
        { model: Organization, as: 'organization' },
        { 
          model: Patent, 
          as: 'patents',
          include: [{ model: require('../models').Category, as: 'category' }]
        },
        { 
          model: Document, 
          as: 'documents',
          include: [{ model: require('../models').Category, as: 'category' }]
        }
      ]
    });

    if (!author) {
      return res.status(404).json({ message: 'Автора не знайдено' });
    }

    res.json(author);
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Створити автора
exports.create = async (req, res) => {
  try {
    const author = await Author.create(req.body);

    const result = await Author.findByPk(author.id, {
      include: [{ model: Organization, as: 'organization' }]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Оновити автора
exports.update = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Автора не знайдено' });
    }

    await author.update(req.body);

    const result = await Author.findByPk(author.id, {
      include: [{ model: Organization, as: 'organization' }]
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Видалити автора
exports.delete = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Автора не знайдено' });
    }

    await author.destroy();

    res.json({ message: 'Автора успішно видалено' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Співавтори (мережа авторів)
exports.getCoauthors = async (req, res) => {
  try {
    const authors = await Author.findAll({
      include: [
        { model: Patent, as: 'patents', attributes: ['id'] },
        { model: Organization, as: 'organization', attributes: ['id', 'name'] }
      ]
    });

    // Будуємо граф співавторства
    const nodes = [];
    const links = [];
    const coauthorMap = new Map();

    for (const author of authors) {
      const patentsCount = author.patents ? author.patents.length : 0;
      if (patentsCount > 0) {
        nodes.push({
          id: author.id,
          name: `${author.lastName} ${author.firstName.charAt(0)}.`,
          fullName: `${author.lastName} ${author.firstName} ${author.middleName || ''}`.trim(),
          organization: author.organization?.name || '',
          patentsCount
        });
      }
    }

    // Знаходимо співавторів
    const patents = await Patent.findAll({
      include: [{ model: Author, as: 'authors', attributes: ['id'] }]
    });

    for (const patent of patents) {
      const authorIds = patent.authors.map(a => a.id);
      for (let i = 0; i < authorIds.length; i++) {
        for (let j = i + 1; j < authorIds.length; j++) {
          const key = [authorIds[i], authorIds[j]].sort().join('-');
          coauthorMap.set(key, (coauthorMap.get(key) || 0) + 1);
        }
      }
    }

    for (const [key, value] of coauthorMap) {
      const [source, target] = key.split('-').map(Number);
      links.push({ source, target, value });
    }

    res.json({ nodes, links });
  } catch (error) {
    console.error('Error fetching coauthors:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Топ авторів
exports.getTopAuthors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const authors = await Author.findAll({
      include: [
        { model: Organization, as: 'organization', attributes: ['id', 'name', 'shortName'] }
      ]
    });

    const authorsWithCounts = await Promise.all(authors.map(async (author) => {
      const patentsCount = await author.countPatents();
      const documentsCount = await author.countDocuments();
      return {
        ...author.toJSON(),
        patentsCount,
        documentsCount,
        totalPublications: patentsCount + documentsCount
      };
    }));

    authorsWithCounts.sort((a, b) => b.totalPublications - a.totalPublications);

    res.json(authorsWithCounts.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Error fetching top authors:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};
