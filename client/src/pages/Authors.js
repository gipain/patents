import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { authorsAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import "./Authors.css";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await authorsAPI.getAll(params);
        setAuthors(
          response.data.authors || response.data.data || response.data,
        );
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          }));
        }
      } catch (error) {
        console.error("Error fetching authors:", error);
        toast.error("Помилка завантаження авторів");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [pagination.page, pagination.limit, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цього автора?")) {
      try {
        await authorsAPI.delete(id);
        setAuthors((prev) => prev.filter((author) => author.id !== id));
        toast.success("Автора видалено");
      } catch (error) {
        toast.error("Помилка видалення");
      }
    }
  };

  const getInitials = (author) => {
    const first = author.firstName?.[0] || "";
    const last = author.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "??";
  };

  return (
    <div className="authors-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              <FiUsers /> Автори
            </h1>
            <p>Науковці, винахідники та дослідники</p>
          </div>
          <Link to="/authors/new" className="btn btn-primary">
            <FiPlus /> Додати автора
          </Link>
        </div>

        {/* Пошук */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FiSearch />
              <input
                type="text"
                placeholder="Пошук за ім'ям або прізвищем..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Пошук
            </button>
          </form>
        </div>

        {/* Результати */}
        {loading ? (
          <Loading />
        ) : authors.length === 0 ? (
          <div className="empty-state">
            <FiUsers size={48} />
            <h3>Авторів не знайдено</h3>
            <p>Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>Знайдено: {pagination.total} авторів</span>
            </div>

            <div className="authors-grid">
              {authors.map((author) => (
                <div key={author.id} className="author-card">
                  <div className="author-avatar">{getInitials(author)}</div>

                  <div className="author-info">
                    <h3 className="author-name">
                      <Link to={`/authors/${author.id}`}>
                        {author.lastName} {author.firstName}{" "}
                        {author.middleName || ""}
                      </Link>
                    </h3>

                    {author.degree && (
                      <p className="author-degree">{author.degree}</p>
                    )}

                    {author.organization && (
                      <p className="author-org">
                        <FiMapPin size={14} />
                        {author.organization.shortName ||
                          author.organization.name}
                      </p>
                    )}

                    {author.email && (
                      <p className="author-contact">
                        <FiMail size={14} />
                        <a href={`mailto:${author.email}`}>{author.email}</a>
                      </p>
                    )}
                  </div>

                  <div className="author-stats">
                    {author.patentsCount !== undefined && (
                      <div className="stat">
                        <span className="stat-value">
                          {author.patentsCount || 0}
                        </span>
                        <span className="stat-label">патентів</span>
                      </div>
                    )}
                    {author.documentsCount !== undefined && (
                      <div className="stat">
                        <span className="stat-value">
                          {author.documentsCount || 0}
                        </span>
                        <span className="stat-label">публікацій</span>
                      </div>
                    )}
                  </div>

                  <div className="author-actions">
                    <Link
                      to={`/authors/${author.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      <FiEye /> Профіль
                    </Link>
                    <Link
                      to={`/authors/${author.id}/edit`}
                      className="btn btn-sm btn-outline"
                    >
                      <FiEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(author.id)}
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

export default Authors;
