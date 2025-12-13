const {
  Patent,
  Document,
  Author,
  Category,
  Organization,
  SearchHistory,
} = require("../models");
const { fn, col, literal } = require("sequelize");

// Загальна статистика
exports.getOverview = async (req, res) => {
  try {
    const [
      totalPatents,
      totalDocuments,
      totalAuthors,
      totalCategories,
      totalOrganizations,
    ] = await Promise.all([
      Patent.count(),
      Document.count(),
      Author.count(),
      Category.count(),
      Organization.count(),
    ]);

    // Останні додані
    const recentPatents = await Patent.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [{ model: Category, as: "category", attributes: ["name"] }],
    });

    const recentDocuments = await Document.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [{ model: Category, as: "category", attributes: ["name"] }],
    });

    // Статистика за статусами патентів
    const patentsByStatus = await Patent.findAll({
      attributes: ["status", [fn("COUNT", "*"), "count"]],
      group: ["status"],
    });

    // Статистика за типами документів
    const documentsByType = await Document.findAll({
      attributes: ["documentType", [fn("COUNT", "*"), "count"]],
      group: ["documentType"],
    });

    res.json({
      totals: {
        patents: totalPatents,
        documents: totalDocuments,
        authors: totalAuthors,
        categories: totalCategories,
        organizations: totalOrganizations,
      },
      recent: {
        patents: recentPatents,
        documents: recentDocuments,
      },
      distributions: {
        patentsByStatus,
        documentsByType,
      },
    });
  } catch (error) {
    console.error("Error fetching stats overview:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Тренди по роках
exports.getTrends = async (req, res) => {
  try {
    const { years = 10 } = req.query;

    const patentsByYear = await Patent.findAll({
      attributes: [
        [fn("strftime", "%Y", col("publication_date")), "year"],
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        publicationDate: { [require("sequelize").Op.not]: null },
      },
      group: [literal("strftime('%Y', publication_date)")],
      order: [[literal("year"), "ASC"]],
      limit: parseInt(years),
    });

    const documentsByYear = await Document.findAll({
      attributes: [
        [fn("strftime", "%Y", col("publication_date")), "year"],
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        publicationDate: { [require("sequelize").Op.not]: null },
      },
      group: [literal("strftime('%Y', publication_date)")],
      order: [[literal("year"), "ASC"]],
      limit: parseInt(years),
    });

    // Патенти за типами по роках
    const patentTypesByYear = await Patent.findAll({
      attributes: [
        [fn("strftime", "%Y", col("publication_date")), "year"],
        "patentType",
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        publicationDate: { [require("sequelize").Op.not]: null },
      },
      group: [literal("strftime('%Y', publication_date)"), "patentType"],
      order: [[literal("year"), "ASC"]],
    });

    res.json({
      patentsByYear,
      documentsByYear,
      patentTypesByYear,
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Статистика по категоріях
exports.getCategoryStats = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        { model: Patent, as: "patents", attributes: ["id"] },
        { model: Document, as: "documents", attributes: ["id"] },
      ],
    });

    const stats = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      patentsCount: cat.patents ? cat.patents.length : 0,
      documentsCount: cat.documents ? cat.documents.length : 0,
      total:
        (cat.patents ? cat.patents.length : 0) +
        (cat.documents ? cat.documents.length : 0),
    }));

    stats.sort((a, b) => b.total - a.total);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching category stats:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Статистика по організаціях
exports.getOrganizationStats = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      include: [
        { model: Patent, as: "patents", attributes: ["id"] },
        { model: Author, as: "authors", attributes: ["id"] },
      ],
    });

    const stats = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      shortName: org.shortName,
      country: org.country,
      patentsCount: org.patents ? org.patents.length : 0,
      authorsCount: org.authors ? org.authors.length : 0,
    }));

    stats.sort((a, b) => b.patentsCount - a.patentsCount);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Найпопулярніші IPC коди
exports.getTopIPCCodes = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const ipcStats = await Patent.findAll({
      attributes: ["ipcCode", [fn("COUNT", "*"), "count"]],
      where: {
        ipcCode: { [require("sequelize").Op.not]: null },
      },
      group: ["ipcCode"],
      order: [[literal("count"), "DESC"]],
      limit: parseInt(limit),
    });

    res.json(ipcStats);
  } catch (error) {
    console.error("Error fetching IPC stats:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Аналітика пошуку
exports.getSearchAnalytics = async (req, res) => {
  try {
    const totalSearches = await SearchHistory.count();

    const searchesByType = await SearchHistory.findAll({
      attributes: ["searchType", [fn("COUNT", "*"), "count"]],
      group: ["searchType"],
    });

    const avgResultsCount = await SearchHistory.findOne({
      attributes: [[fn("AVG", col("results_count")), "avgResults"]],
    });

    const searchesByDay = await SearchHistory.findAll({
      attributes: [
        [fn("DATE", col("created_at")), "date"],
        [fn("COUNT", "*"), "count"],
      ],
      group: [fn("DATE", col("created_at"))],
      order: [[literal("date"), "DESC"]],
      limit: 30,
    });

    res.json({
      totalSearches,
      searchesByType,
      avgResultsCount: avgResultsCount?.dataValues?.avgResults || 0,
      searchesByDay,
    });
  } catch (error) {
    console.error("Error fetching search analytics:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Статистика для дашборду
exports.getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Загальна статистика
    const [totalPatents, totalDocuments, totalAuthors, totalCategories] =
      await Promise.all([
        Patent.count(),
        Document.count(),
        Author.count(),
        Category.count(),
      ]);

    // Патенти цього року
    const patentsThisYear = await Patent.count({
      where: {
        createdAt: {
          [require("sequelize").Op.gte]: new Date(currentYear, 0, 1),
        },
      },
    });

    // Документи цього року
    const documentsThisYear = await Document.count({
      where: {
        createdAt: {
          [require("sequelize").Op.gte]: new Date(currentYear, 0, 1),
        },
      },
    });

    // Патенти за категоріями
    const categories = await Category.findAll({
      include: [{ model: Patent, as: "patents", attributes: ["id"] }],
    });

    const patentsByCategory = categories
      .map((cat) => ({
        name: cat.name,
        count: cat.patents ? cat.patents.length : 0,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Патенти за статусами
    const patentsByStatus = await Patent.findAll({
      attributes: ["status", [fn("COUNT", "*"), "count"]],
      group: ["status"],
      raw: true,
    });

    const statusLabels = {
      granted: "Діючі",
      pending: "Очікують",
      expired: "Закінчились",
      rejected: "Відхилені",
    };

    const patentsByStatusFormatted = patentsByStatus.map((s) => ({
      status: s.status,
      count: parseInt(s.count),
      label: statusLabels[s.status] || s.status,
    }));

    // Патенти за роками
    const patentsByYear = await Patent.findAll({
      attributes: [
        [fn("strftime", "%Y", col("created_at")), "year"],
        [fn("COUNT", "*"), "count"],
      ],
      group: [literal("strftime('%Y', created_at)")],
      order: [[literal("year"), "ASC"]],
      raw: true,
    });

    const patentsByYearFormatted = patentsByYear.map((p) => ({
      year: parseInt(p.year),
      count: parseInt(p.count),
    }));

    // Документи за типами
    const documentsByType = await Document.findAll({
      attributes: ["documentType", [fn("COUNT", "*"), "count"]],
      group: ["documentType"],
      raw: true,
    });

    const typeLabels = {
      article: "Статті",
      thesis: "Дисертації",
      report: "Звіти",
      conference: "Конференції",
      book: "Книги",
      manual: "Посібники",
      standard: "Стандарти",
      monograph: "Монографії",
    };

    const documentsByTypeFormatted = documentsByType.map((d) => ({
      type: d.documentType,
      count: parseInt(d.count),
      label: typeLabels[d.documentType] || d.documentType,
    }));

    // Документи за роками
    const documentsByYear = await Document.findAll({
      attributes: [
        [fn("strftime", "%Y", col("created_at")), "year"],
        [fn("COUNT", "*"), "count"],
      ],
      group: [literal("strftime('%Y', created_at)")],
      order: [[literal("year"), "ASC"]],
      raw: true,
    });

    const documentsByYearFormatted = documentsByYear.map((d) => ({
      year: parseInt(d.year),
      count: parseInt(d.count),
    }));

    // Топ авторів
    const authors = await Author.findAll({
      include: [
        { model: Patent, as: "patents", attributes: ["id"] },
        { model: Document, as: "documents", attributes: ["id"] },
      ],
    });

    const topAuthors = authors
      .map((a) => ({
        name: `${a.lastName} ${a.firstName[0]}.`,
        patents: a.patents ? a.patents.length : 0,
        documents: a.documents ? a.documents.length : 0,
      }))
      .sort((a, b) => b.patents + b.documents - (a.patents + a.documents))
      .slice(0, 5);

    res.json({
      overview: {
        totalPatents,
        totalDocuments,
        totalAuthors,
        totalCategories,
        patentsThisYear,
        documentsThisYear,
      },
      patentsByCategory,
      patentsByStatus: patentsByStatusFormatted,
      patentsByYear: patentsByYearFormatted,
      documentsByType: documentsByTypeFormatted,
      documentsByYear: documentsByYearFormatted,
      topAuthors,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};
