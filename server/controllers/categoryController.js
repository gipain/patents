const { Category, Patent, Document } = require('../models');

// Отримати всі категорії
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null },
      include: [
        { model: Category, as: 'subcategories' }
      ],
      order: [['name', 'ASC']]
    });

    // Додаємо підрахунок патентів і документів
    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
      const patentsCount = await Patent.count({ where: { categoryId: category.id } });
      const documentsCount = await Document.count({ where: { categoryId: category.id } });
      
      const subcategoriesWithCounts = await Promise.all(
        (category.subcategories || []).map(async (sub) => {
          const subPatents = await Patent.count({ where: { categoryId: sub.id } });
          const subDocs = await Document.count({ where: { categoryId: sub.id } });
          return {
            ...sub.toJSON(),
            patentsCount: subPatents,
            documentsCount: subDocs
          };
        })
      );

      return {
        ...category.toJSON(),
        subcategories: subcategoriesWithCounts,
        patentsCount,
        documentsCount
      };
    }));

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримати плоский список категорій
exports.getAllFlat = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримати категорію за ID
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'subcategories' },
        { model: Category, as: 'parent' }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    const patentsCount = await Patent.count({ where: { categoryId: category.id } });
    const documentsCount = await Document.count({ where: { categoryId: category.id } });

    res.json({
      ...category.toJSON(),
      patentsCount,
      documentsCount
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Створити категорію
exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Оновити категорію
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    await category.update(req.body);
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Видалити категорію
exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    // Перевіряємо чи є патенти або документи
    const patentsCount = await Patent.count({ where: { categoryId: category.id } });
    const documentsCount = await Document.count({ where: { categoryId: category.id } });

    if (patentsCount > 0 || documentsCount > 0) {
      return res.status(400).json({ 
        message: 'Неможливо видалити категорію, яка містить патенти або документи' 
      });
    }

    await category.destroy();
    res.json({ message: 'Категорію успішно видалено' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};
