import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
} from "react-icons/fi";
import { patentsAPI, categoriesAPI, exportAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import "./Patents.css";

const Patents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patents, setPatents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    status: searchParams.get("status") || "",
    patentType: searchParams.get("patentType") || "",
    year: searchParams.get("year") || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchPatents = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      };

      const response = await patentsAPI.getAll(params);
      setPatents(response.data.patents);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching patents:", error);
      toast.error("Помилка завантаження патентів");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoriesAPI.getAllFlat().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    fetchPatents(pagination.page);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatents(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей патент?")) {
      try {
        await patentsAPI.delete(id);
        toast.success("Патент видалено");
        fetchPatents(pagination.page);
      } catch (error) {
        toast.error("Помилка видалення патенту");
      }
    }
  };

  const handleExport = async (format) => {
    try {
      const params = {
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      };

      const response = await exportAPI.patents(params);

      if (format === "json") {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `patents-export.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `patents-export.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success("Експорт успішно завершено!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Помилка експорту");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      granted: { class: "badge-success", text: "Діючий" },
      pending: { class: "badge-warning", text: "Очікує" },
      expired: { class: "badge-secondary", text: "Закінчився" },
      rejected: { class: "badge-danger", text: "Відхилено" },
    };
    return statusMap[status] || { class: "badge-secondary", text: status };
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      invention: "Винахід",
      utility_model: "Корисна модель",
      design: "Промисловий зразок",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="patents-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Патенти</h1>
            <p className="page-subtitle">Всього: {pagination.total} патентів</p>
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
            <Link to="/patents/new" className="btn btn-primary">
              <FiPlus /> Додати патент
            </Link>
          </div>
        </div>

        {/* Пошук і фільтри */}
        <div className="filters-section card">
          <div className="card-body">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Пошук за назвою, номером, ключовими словами..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="form-control search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Пошук
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter /> Фільтри
              </button>
            </form>

            {showFilters && (
              <div className="filters-row">
                <div className="filter-group">
                  <label>Категорія</label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="form-control"
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
                  <label>Статус</label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="">Всі статуси</option>
                    <option value="granted">Діючий</option>
                    <option value="pending">Очікує</option>
                    <option value="expired">Закінчився</option>
                    <option value="rejected">Відхилено</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Тип патенту</label>
                  <select
                    value={filters.patentType}
                    onChange={(e) =>
                      handleFilterChange("patentType", e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="">Всі типи</option>
                    <option value="invention">Винахід</option>
                    <option value="utility_model">Корисна модель</option>
                    <option value="design">Промисловий зразок</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Рік</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                    className="form-control"
                  >
                    <option value="">Всі роки</option>
                    {Array.from({ length: 15 }, (_, i) => 2024 - i).map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Список патентів */}
        {loading ? (
          <Loading />
        ) : patents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <div className="empty-state-title">Патентів не знайдено</div>
            <p>Спробуйте змінити параметри пошуку або фільтри</p>
          </div>
        ) : (
          <>
            <div className="patents-grid">
              {patents.map((patent) => {
                const statusBadge = getStatusBadge(patent.status);
                return (
                  <div key={patent.id} className="patent-card card">
                    <div className="card-body">
                      <div className="patent-header">
                        <span className="patent-number">{patent.number}</span>
                        <span className={`badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>

                      <h3 className="patent-title">
                        <Link to={`/patents/${patent.id}`}>{patent.title}</Link>
                      </h3>

                      <p className="patent-abstract">
                        {patent.abstract?.substring(0, 150)}...
                      </p>

                      <div className="patent-info">
                        {patent.ipcCode && (
                          <div className="info-item">
                            <span className="info-label">IPC:</span>
                            <span>{patent.ipcCode}</span>
                          </div>
                        )}
                        {patent.publicationDate && (
                          <div className="info-item">
                            <span className="info-label">Публікація:</span>
                            <span>
                              {new Date(
                                patent.publicationDate,
                              ).toLocaleDateString("uk-UA")}
                            </span>
                          </div>
                        )}
                        <div className="info-item">
                          <span className="info-label">Тип:</span>
                          <span>{getTypeBadge(patent.patentType)}</span>
                        </div>
                      </div>

                      {patent.authors && patent.authors.length > 0 && (
                        <div className="patent-authors">
                          <span className="info-label">Автори:</span>
                          <span>
                            {patent.authors
                              .map(
                                (a) =>
                                  `${a.lastName} ${a.firstName.charAt(0)}.`,
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}

                      {patent.category && (
                        <div className="patent-category">
                          <span className="badge badge-primary">
                            {patent.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <div className="patent-actions">
                        <Link
                          to={`/patents/${patent.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          <FiEye /> Переглянути
                        </Link>
                        <Link
                          to={`/patents/${patent.id}/edit`}
                          className="btn btn-sm btn-outline"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(patent.id)}
                          className="btn btn-sm btn-outline btn-danger-outline"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                setPagination((prev) => ({ ...prev, page }));
                fetchPatents(page);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Patents;
