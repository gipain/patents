import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiAward,
  FiFileText,
  FiUser,
  FiFolder,
  FiX,
  FiDownload,
} from "react-icons/fi";
import { searchAPI, categoriesAPI, authorsAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import "./Search.css";

const Search = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdvanced = location.pathname === "/search/advanced";

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    patents: [],
    documents: [],
    authors: [],
  });
  const [counts, setCounts] = useState({
    patents: 0,
    documents: 0,
    authors: 0,
  });
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(isAdvanced);

  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    type: "all", // all, patents, documents, authors
    categoryId: "",
    status: "",
    yearFrom: "",
    yearTo: "",
    author: "",
    sortBy: "relevance",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data || response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Автоматичний пошук при наявності параметра q в URL
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && queryParam.trim()) {
      setFilters((prev) => ({ ...prev, query: queryParam }));
      // Виконуємо пошук з невеликою затримкою
      const timer = setTimeout(() => {
        performSearch(queryParam, 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const performSearch = async (query, newPage = 1) => {
    if (!query || !query.trim()) {
      toast.warning("Введіть пошуковий запит");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const params = {
        q: query,
        page: newPage,
        limit: pagination.limit,
        type: filters.type,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.yearFrom && { yearFrom: filters.yearFrom }),
        ...(filters.yearTo && { yearTo: filters.yearTo }),
      };

      const response = await searchAPI.search(params);
      const data = response.data;

      setResults(data.results || { patents: [], documents: [], authors: [] });
      setCounts(data.counts || { patents: 0, documents: 0, authors: 0 });
      setPagination((prev) => ({
        ...prev,
        page: newPage,
        total: data.total || 0,
        totalPages:
          data.pagination?.totalPages ||
          Math.ceil((data.total || 0) / prev.limit),
      }));
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Помилка пошуку");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e, newPage = 1) => {
    if (e) e.preventDefault();
    performSearch(filters.query, newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      type: "all",
      categoryId: "",
      status: "",
      yearFrom: "",
      yearTo: "",
      author: "",
      sortBy: "relevance",
    });
  };

  const getResultsByTab = () => {
    switch (activeTab) {
      case "patents":
        return results.patents || [];
      case "documents":
        return results.documents || [];
      case "authors":
        return results.authors || [];
      default:
        return [
          ...(results.patents || []).map((p) => ({ ...p, _type: "patent" })),
          ...(results.documents || []).map((d) => ({
            ...d,
            _type: "document",
          })),
          ...(results.authors || []).map((a) => ({ ...a, _type: "author" })),
        ];
    }
  };

  const getTotalCount = () => {
    return counts.patents + counts.documents + counts.authors;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>
            <FiSearch /> {isAdvanced ? "Розширений пошук" : "Пошук"}
          </h1>
          <p>
            {isAdvanced
              ? "Пошук патентів, документів та авторів за різними критеріями з детальними фільтрами"
              : "Швидкий пошук патентів, документів та авторів"}
          </p>
          {!isAdvanced && (
            <Link
              to="/search/advanced"
              className="btn btn-outline-primary btn-sm"
            >
              <FiFilter /> Розширений пошук
            </Link>
          )}
        </div>

        {/* Форма пошуку */}
        <div className="search-form-section">
          <form onSubmit={handleSearch} className="main-search-form">
            <div className="search-input-wrapper">
              <FiSearch />
              <input
                type="text"
                name="query"
                placeholder="Введіть пошуковий запит..."
                value={filters.query}
                onChange={handleFilterChange}
              />
              {filters.query && (
                <button
                  type="button"
                  className="clear-input"
                  onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
                >
                  <FiX />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              <FiSearch /> Пошук
            </button>
          </form>

          {/* Фільтри - завжди показуємо для розширеного пошуку */}
          {(isAdvanced || showFilters) && (
            <div className="filters-panel">
              <div className="filters-header">
                <h3>
                  <FiFilter /> Фільтри
                </h3>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={clearFilters}
                >
                  Скинути
                </button>
              </div>

              <div className="filters-grid">
                <div className="filter-group">
                  <label>Тип</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="all">Всі типи</option>
                    <option value="patents">Тільки патенти</option>
                    <option value="documents">Тільки документи</option>
                    <option value="authors">Тільки автори</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Категорія</label>
                  <select
                    name="categoryId"
                    value={filters.categoryId}
                    onChange={handleFilterChange}
                  >
                    <option value="">Всі категорії</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Статус патенту</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Будь-який</option>
                    <option value="granted">Діючий</option>
                    <option value="pending">Очікує</option>
                    <option value="expired">Закінчився</option>
                    <option value="rejected">Відхилено</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Рік від</label>
                  <select
                    name="yearFrom"
                    value={filters.yearFrom}
                    onChange={handleFilterChange}
                  >
                    <option value="">Будь-який</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Рік до</label>
                  <select
                    name="yearTo"
                    value={filters.yearTo}
                    onChange={handleFilterChange}
                  >
                    <option value="">Будь-який</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Сортування</label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="relevance">За релевантністю</option>
                    <option value="date_desc">Спочатку нові</option>
                    <option value="date_asc">Спочатку старі</option>
                    <option value="title">За назвою</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка показати/сховати фільтри для звичайного пошуку */}
          {!isAdvanced && !showFilters && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-show-filters"
              onClick={() => setShowFilters(true)}
            >
              <FiFilter /> Показати фільтри
            </button>
          )}
        </div>

        {/* Результати */}
        {loading ? (
          <Loading />
        ) : getTotalCount() > 0 ? (
          <div className="search-results">
            <div className="results-tabs">
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Всі ({getTotalCount()})
              </button>
              <button
                className={`tab ${activeTab === "patents" ? "active" : ""}`}
                onClick={() => setActiveTab("patents")}
              >
                <FiAward /> Патенти ({counts.patents})
              </button>
              <button
                className={`tab ${activeTab === "documents" ? "active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                <FiFileText /> Документи ({counts.documents})
              </button>
              <button
                className={`tab ${activeTab === "authors" ? "active" : ""}`}
                onClick={() => setActiveTab("authors")}
              >
                <FiUser /> Автори ({counts.authors})
              </button>
            </div>

            <div className="results-list">
              {getResultsByTab().map((item, index) => (
                <ResultItem
                  key={`${item._type || activeTab}-${item.id}-${index}`}
                  item={item}
                  type={item._type || activeTab}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => handleSearch(null, page)}
              />
            )}
          </div>
        ) : hasSearched && !loading ? (
          <div className="no-results">
            <FiSearch size={48} />
            <h3>Нічого не знайдено</h3>
            <p>Спробуйте змінити пошуковий запит або фільтри</p>
          </div>
        ) : (
          <div className="search-tips">
            <h3>Поради для пошуку</h3>
            <ul>
              <li>Використовуйте ключові слова з назви або опису</li>
              <li>Введіть номер патенту для точного пошуку</li>
              <li>Пошук за прізвищем автора</li>
              <li>Використовуйте фільтри для звуження результатів</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultItem = ({ item, type }) => {
  const getIcon = () => {
    switch (type) {
      case "patent":
      case "patents":
        return <FiAward />;
      case "document":
      case "documents":
        return <FiFileText />;
      case "author":
      case "authors":
        return <FiUser />;
      default:
        return <FiFileText />;
    }
  };

  const getLink = () => {
    switch (type) {
      case "patent":
      case "patents":
        return `/patents/${item.id}`;
      case "document":
      case "documents":
        return `/documents/${item.id}`;
      case "author":
      case "authors":
        return `/authors/${item.id}`;
      default:
        return "#";
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "patent":
      case "patents":
        return "Патент";
      case "document":
      case "documents":
        return "Документ";
      case "author":
      case "authors":
        return "Автор";
      default:
        return "";
    }
  };

  const getTitle = () => {
    if (type === "author" || type === "authors") {
      return `${item.lastName} ${item.firstName} ${item.middleName || ""}`;
    }
    return item.title;
  };

  const getSubtitle = () => {
    if (type === "patent" || type === "patents") {
      return item.number;
    }
    if (type === "author" || type === "authors") {
      return item.degree || item.position || "";
    }
    return item.documentType || "";
  };

  return (
    <Link to={getLink()} className="result-item">
      <div className="result-icon">{getIcon()}</div>
      <div className="result-content">
        <span className="result-type">{getTypeLabel()}</span>
        <h4>{getTitle()}</h4>
        {getSubtitle() && <p className="result-subtitle">{getSubtitle()}</p>}
        {item.abstract && (
          <p className="result-abstract">
            {item.abstract.length > 200
              ? `${item.abstract.substring(0, 200)}...`
              : item.abstract}
          </p>
        )}
      </div>
    </Link>
  );
};

export default Search;
