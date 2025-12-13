import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiFile,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiFilter,
} from "react-icons/fi";
import { documentsAPI, categoriesAPI, exportAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import "./Documents.css";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    documentType: "",
    year: "",
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

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== ""),
          ),
        };

        const response = await documentsAPI.getAll(params);
        setDocuments(response.data.documents || response.data.data || []);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          }));
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Помилка завантаження документів");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [pagination.page, pagination.limit, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleExport = async (format) => {
    try {
      const params = {
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      };

      const response = await exportAPI.documents(params);

      if (format === "json") {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `documents-export.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `documents-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success("Експорт успішно завершено!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Помилка експорту");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей документ?")) {
      try {
        await documentsAPI.delete(id);
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast.success("Документ видалено");
      } catch (error) {
        toast.error("Помилка видалення");
      }
    }
  };

  const getDocTypeText = (type) => {
    const typeMap = {
      article: "Стаття",
      thesis: "Дисертація",
      report: "Звіт",
      book: "Книга",
      conference: "Конференція",
      manual: "Посібник",
      standard: "Стандарт",
    };
    return typeMap[type] || type;
  };

  const getDocTypeClass = (type) => {
    const classMap = {
      article: "primary",
      thesis: "success",
      report: "warning",
      book: "info",
      conference: "secondary",
      manual: "danger",
      standard: "dark",
    };
    return classMap[type] || "secondary";
  };

  // Генерація років для фільтра
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="documents-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              <FiFile /> Документи
            </h1>
            <p>
              Наукові публікації, статті, дисертації та технічна документація
            </p>
          </div>
          <div className="header-actions">
            <div className="export-dropdown">
              <button className="btn btn-outline">
                <FiDownload /> Експорт
              </button>
              <div className="export-menu">
                <button onClick={() => handleExport("csv")}>CSV</button>
                <button onClick={() => handleExport("json")}>JSON</button>
                <button onClick={() => handleExport("pdf")}>PDF</button>
              </div>
            </div>
            <Link to="/documents/new" className="btn btn-primary">
              <FiPlus /> Додати документ
            </Link>
          </div>
        </div>

        {/* Фільтри */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FiSearch />
              <input
                type="text"
                name="search"
                placeholder="Пошук за назвою або ключовими словами..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Пошук
            </button>
          </form>

          <div className="filters-row">
            <div className="filter-group">
              <label>
                <FiFilter /> Категорія
              </label>
              <select
                name="category"
                value={filters.category}
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
              <label>Тип документа</label>
              <select
                name="documentType"
                value={filters.documentType}
                onChange={handleFilterChange}
              >
                <option value="">Всі типи</option>
                <option value="article">Стаття</option>
                <option value="thesis">Дисертація</option>
                <option value="report">Звіт</option>
                <option value="book">Книга</option>
                <option value="conference">Конференція</option>
                <option value="manual">Посібник</option>
                <option value="standard">Стандарт</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Рік</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
              >
                <option value="">Всі роки</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Результати */}
        {loading ? (
          <Loading />
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <FiFile size={48} />
            <h3>Документів не знайдено</h3>
            <p>Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>Знайдено: {pagination.total} документів</span>
            </div>

            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className="document-card-header">
                    <span
                      className={`doc-type-badge badge-${getDocTypeClass(
                        doc.documentType,
                      )}`}
                    >
                      {getDocTypeText(doc.documentType)}
                    </span>
                    {doc.publicationYear && (
                      <span className="doc-year">{doc.publicationYear}</span>
                    )}
                  </div>

                  <h3 className="document-title">
                    <Link to={`/documents/${doc.id}`}>{doc.title}</Link>
                  </h3>

                  {doc.authors && doc.authors.length > 0 && (
                    <p className="document-authors">
                      {doc.authors
                        .map((a) => `${a.lastName} ${a.firstName[0]}.`)
                        .join(", ")}
                    </p>
                  )}

                  {doc.abstract && (
                    <p className="document-abstract">
                      {doc.abstract.length > 150
                        ? `${doc.abstract.substring(0, 150)}...`
                        : doc.abstract}
                    </p>
                  )}

                  {doc.journal && (
                    <p className="document-journal">{doc.journal}</p>
                  )}

                  <div className="document-meta">
                    {doc.category && (
                      <span className="meta-item">
                        <FiFilter /> {doc.category.name}
                      </span>
                    )}
                    <span className="meta-item">
                      <FiEye /> {doc.viewCount || 0}
                    </span>
                  </div>

                  <div className="document-actions">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      <FiEye /> Переглянути
                    </Link>
                    <Link
                      to={`/documents/${doc.id}/edit`}
                      className="btn btn-sm btn-outline"
                    >
                      <FiEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="btn btn-sm btn-danger"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Documents;
