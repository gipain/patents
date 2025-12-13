const {
  Patent,
  Document,
  Author,
  Category,
  SearchHistory,
} = require("../models");
const { Op } = require("sequelize");

// Глобальний пошук
exports.globalSearch = async (req, res) => {
  try {
    const {
      q,
      type = "all",
      categoryId,
      status,
      yearFrom,
      yearTo,
      page = 1,
      limit = 20,
    } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ message: "Запит повинен містити мінімум 2 символи" });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const results = {
      patents: [],
      documents: [],
      authors: [],
    };
    let patentsTotal = 0;
    let documentsTotal = 0;
    let authorsTotal = 0;

    // Пошук патентів
    if (type === "patents" || type === "all") {
      const patentWhere = {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { number: { [Op.like]: `%${q}%` } },
          { abstract: { [Op.like]: `%${q}%` } },
          { keywords: { [Op.like]: `%${q}%` } },
          { ipcCode: { [Op.like]: `%${q}%` } },
          { applicant: { [Op.like]: `%${q}%` } },
        ],
      };

      // Додаткові фільтри
      if (categoryId) {
        patentWhere.categoryId = categoryId;
      }
      if (status) {
        patentWhere.status = status;
      }
      if (yearFrom || yearTo) {
        patentWhere.publicationDate = {};
        if (yearFrom) patentWhere.publicationDate[Op.gte] = `${yearFrom}-01-01`;
        if (yearTo) patentWhere.publicationDate[Op.lte] = `${yearTo}-12-31`;
      }

      const { count, rows } = await Patent.findAndCountAll({
        where: patentWhere,
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "code"],
          },
          {
            model: Author,
            as: "authors",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
        limit: type === "patents" ? parseInt(limit) : 10,
        offset: type === "patents" ? offset : 0,
        order: [["publicationDate", "DESC"]],
        distinct: true,
      });

      results.patents = rows;
      patentsTotal = count;
    }

    // Пошук документів
    if (type === "documents" || type === "all") {
      const docWhere = {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { abstract: { [Op.like]: `%${q}%` } },
          { keywords: { [Op.like]: `%${q}%` } },
          { publisher: { [Op.like]: `%${q}%` } },
        ],
      };

      if (categoryId) {
        docWhere.categoryId = categoryId;
      }
      if (yearFrom || yearTo) {
        docWhere.publicationDate = {};
        if (yearFrom) docWhere.publicationDate[Op.gte] = `${yearFrom}-01-01`;
        if (yearTo) docWhere.publicationDate[Op.lte] = `${yearTo}-12-31`;
      }

      const { count, rows } = await Document.findAndCountAll({
        where: docWhere,
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "code"],
          },
          {
            model: Author,
            as: "authors",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
        limit: type === "documents" ? parseInt(limit) : 10,
        offset: type === "documents" ? offset : 0,
        order: [["publicationDate", "DESC"]],
        distinct: true,
      });

      results.documents = rows;
      documentsTotal = count;
    }

    // Пошук авторів
    if (type === "authors" || type === "all") {
      const { count, rows } = await Author.findAndCountAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.like]: `%${q}%` } },
            { lastName: { [Op.like]: `%${q}%` } },
            { middleName: { [Op.like]: `%${q}%` } },
            { specialization: { [Op.like]: `%${q}%` } },
          ],
        },
        include: [
          {
            model: require("../models").Organization,
            as: "organization",
            attributes: ["id", "name", "shortName"],
          },
        ],
        limit: type === "authors" ? parseInt(limit) : 10,
        offset: type === "authors" ? offset : 0,
        order: [["lastName", "ASC"]],
        distinct: true,
      });

      results.authors = rows;
      authorsTotal = count;
    }

    // Загальна кількість результатів
    const totalCount = patentsTotal + documentsTotal + authorsTotal;

    // Визначаємо total для пагінації залежно від типу
    let paginationTotal;
    switch (type) {
      case "patents":
        paginationTotal = patentsTotal;
        break;
      case "documents":
        paginationTotal = documentsTotal;
        break;
      case "authors":
        paginationTotal = authorsTotal;
        break;
      default:
        paginationTotal = totalCount;
    }

    // Зберігаємо історію пошуку
    try {
      await SearchHistory.create({
        query: q,
        searchType: type,
        resultsCount: totalCount,
      });
    } catch (e) {
      console.error("Error saving search history:", e);
    }

    res.json({
      query: q,
      results,
      counts: {
        patents: patentsTotal,
        documents: documentsTotal,
        authors: authorsTotal,
      },
      total: paginationTotal,
      totalCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(paginationTotal / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in global search:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Розширений пошук
exports.advancedSearch = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      dateFrom,
      dateTo,
      keywords,
      ipcCode,
      patentNumber,
      documentType,
      searchIn = "all",
      operator = "AND",
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;
    const results = { patents: [], documents: [] };
    const conditions = [];

    // Побудова умов пошуку
    if (title) {
      conditions.push({ title: { [Op.like]: `%${title}%` } });
    }
    if (keywords) {
      conditions.push({ keywords: { [Op.like]: `%${keywords}%` } });
    }

    const whereClause =
      conditions.length > 0
        ? { [operator === "OR" ? Op.or : Op.and]: conditions }
        : {};

    // Пошук патентів
    if (searchIn === "all" || searchIn === "patents") {
      const patentWhere = { ...whereClause };

      if (ipcCode) {
        patentWhere.ipcCode = { [Op.like]: `%${ipcCode}%` };
      }
      if (patentNumber) {
        patentWhere.number = { [Op.like]: `%${patentNumber}%` };
      }
      if (category) {
        patentWhere.categoryId = category;
      }
      if (dateFrom || dateTo) {
        patentWhere.publicationDate = {};
        if (dateFrom) patentWhere.publicationDate[Op.gte] = dateFrom;
        if (dateTo) patentWhere.publicationDate[Op.lte] = dateTo;
      }

      const authorInclude = author
        ? {
            model: Author,
            as: "authors",
            where: {
              [Op.or]: [
                { firstName: { [Op.like]: `%${author}%` } },
                { lastName: { [Op.like]: `%${author}%` } },
              ],
            },
          }
        : {
            model: Author,
            as: "authors",
          };

      const { count, rows } = await Patent.findAndCountAll({
        where: patentWhere,
        include: [authorInclude, { model: Category, as: "category" }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      results.patents = rows;
      results.patentsTotal = count;
    }

    // Пошук документів
    if (searchIn === "all" || searchIn === "documents") {
      const docWhere = { ...whereClause };

      if (documentType) {
        docWhere.documentType = documentType;
      }
      if (category) {
        docWhere.categoryId = category;
      }
      if (dateFrom || dateTo) {
        docWhere.publicationDate = {};
        if (dateFrom) docWhere.publicationDate[Op.gte] = dateFrom;
        if (dateTo) docWhere.publicationDate[Op.lte] = dateTo;
      }

      const authorInclude = author
        ? {
            model: Author,
            as: "authors",
            where: {
              [Op.or]: [
                { firstName: { [Op.like]: `%${author}%` } },
                { lastName: { [Op.like]: `%${author}%` } },
              ],
            },
          }
        : {
            model: Author,
            as: "authors",
          };

      const { count, rows } = await Document.findAndCountAll({
        where: docWhere,
        include: [authorInclude, { model: Category, as: "category" }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      results.documents = rows;
      results.documentsTotal = count;
    }

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Історія пошуку
exports.getSearchHistory = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const history = await SearchHistory.findAll({
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching search history:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// Популярні пошукові запити
exports.getPopularSearches = async (req, res) => {
  try {
    const popular = await SearchHistory.findAll({
      attributes: [
        "query",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("query")),
          "count",
        ],
        [
          require("sequelize").fn(
            "AVG",
            require("sequelize").col("results_count"),
          ),
          "avgResults",
        ],
      ],
      group: ["query"],
      order: [[require("sequelize").literal("count"), "DESC"]],
      limit: 10,
    });

    res.json(popular);
  } catch (error) {
    console.error("Error fetching popular searches:", error);
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};
