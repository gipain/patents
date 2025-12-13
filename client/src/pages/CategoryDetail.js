import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiFolder,
  FiAward,
  FiFileText,
  FiChevronRight,
} from "react-icons/fi";
import { categoriesAPI, patentsAPI, documentsAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import "./CategoryDetail.css";

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [patents, setPatents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patents");
  const [patentsPage, setPatentsPage] = useState(1);
  const [documentsPage, setDocumentsPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Завантажуємо категорію
        const categoryRes = await categoriesAPI.getById(id);
        setCategory(categoryRes.data);

        // Завантажуємо всі категорії для отримання підкатегорій
        const allCategoriesRes = await categoriesAPI.getAll();
        const allCategories = Array.isArray(allCategoriesRes.data)
          ? allCategoriesRes.data.flat()
          : [];

        // Шукаємо підкатегорії для поточної категорії
        const subs = allCategories.filter(
          (cat) => cat.parentId === parseInt(id),
        );
        setSubcategories(subs);

        // Завантажуємо патенти цієї категорії
        const patentsRes = await patentsAPI.getAll({ limit: 1000, page: 1 });
        const allPatents = patentsRes.data.patents || patentsRes.data || [];
        const categoryPatents = Array.isArray(allPatents)
          ? allPatents.filter((p) => p.categoryId === parseInt(id))
          : [];
        setPatents(categoryPatents);

        // Завантажуємо документи цієї категорії
        const docsRes = await documentsAPI.getAll({ limit: 1000, page: 1 });
        const allDocs = docsRes.data.documents || docsRes.data || [];
        const categoryDocs = Array.isArray(allDocs)
          ? allDocs.filter((d) => d.categoryId === parseInt(id))
          : [];
        setDocuments(categoryDocs);
      } catch (error) {
        console.error("Error fetching category details:", error);
        toast.error("Помилка завантаження деталей категорії");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цю категорію?")) {
      try {
        await categoriesAPI.delete(id);
        toast.success("Категорію видалено");
        navigate("/categories");
      } catch (error) {
        toast.error(error.response?.data?.message || "Помилка видалення");
      }
    }
  };

  const paginateItems = (items, page) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };

  const paginatedPatents = paginateItems(patents, patentsPage);
  const paginatedDocuments = paginateItems(documents, documentsPage);

  if (loading) return <Loading />;
  if (!category)
    return (
      <div className="container">
        <p>Категорію не знайдено</p>
      </div>
    );

  return (
    <div className="category-detail">
      <div className="container">
        <div className="detail-header">
          <Link to="/categories" className="back-link">
            <FiArrowLeft /> Назад до категорій
          </Link>

          <div className="detail-actions">
            <Link to={`/categories/${id}/edit`} className="btn btn-outline">
              <FiEdit /> Редагувати
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <FiTrash2 /> Видалити
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="card">
              <div className="card-body">
                <div className="category-header-info">
                  <FiFolder className="header-icon" />
                  <div className="header-text">
                    <h1>{category.name}</h1>
                    {category.code && (
                      <p className="category-code">Код: {category.code}</p>
                    )}
                  </div>
                </div>

                {category.description && (
                  <div className="category-description">
                    <h3>Опис</h3>
                    <p>{category.description}</p>
                  </div>
                )}

                {/* Підкатегорії */}
                {subcategories.length > 0 && (
                  <div className="subcategories-section">
                    <h3>Підкатегорії</h3>
                    <div className="subcategories-list">
                      {subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/categories/${sub.id}`}
                          className="subcategory-link"
                        >
                          <FiChevronRight />
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Табуляція: Патенти / Документи */}
            <div className="card">
              <div className="card-header tabs-header">
                <button
                  className={`tab-btn ${
                    activeTab === "patents" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("patents");
                    setPatentsPage(1);
                  }}
                >
                  <FiAward /> Патенти ({patents.length})
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "documents" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("documents");
                    setDocumentsPage(1);
                  }}
                >
                  <FiFileText /> Документи ({documents.length})
                </button>
              </div>

              <div className="card-body tabs-body">
                {activeTab === "patents" && (
                  <div className="tab-content">
                    {patents.length === 0 ? (
                      <p className="empty-message">
                        У цій категорії патентів не знайдено
                      </p>
                    ) : (
                      <>
                        <div className="items-list">
                          {paginatedPatents.map((patent) => (
                            <div key={patent.id} className="item-card">
                              <div className="item-header">
                                <Link to={`/patents/${patent.id}`}>
                                  <h4>{patent.title}</h4>
                                </Link>
                                <span className="item-number">
                                  {patent.number}
                                </span>
                              </div>
                              {patent.abstract && (
                                <p className="item-abstract">
                                  {patent.abstract.substring(0, 150)}...
                                </p>
                              )}
                              <div className="item-meta">
                                <span className="date">
                                  {new Date(
                                    patent.publicationDate,
                                  ).toLocaleDateString("uk-UA")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {patents.length > itemsPerPage && (
                          <Pagination
                            currentPage={patentsPage}
                            totalPages={Math.ceil(
                              patents.length / itemsPerPage,
                            )}
                            onPageChange={setPatentsPage}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="tab-content">
                    {documents.length === 0 ? (
                      <p className="empty-message">
                        У цій категорії документів не знайдено
                      </p>
                    ) : (
                      <>
                        <div className="items-list">
                          {paginatedDocuments.map((document) => (
                            <div key={document.id} className="item-card">
                              <div className="item-header">
                                <Link to={`/documents/${document.id}`}>
                                  <h4>{document.title}</h4>
                                </Link>
                              </div>
                              {document.description && (
                                <p className="item-description">
                                  {document.description.substring(0, 150)}...
                                </p>
                              )}
                              {document.fileUrl && (
                                <div className="item-meta">
                                  <a
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="file-link"
                                  >
                                    Завантажити файл
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {documents.length > itemsPerPage && (
                          <Pagination
                            currentPage={documentsPage}
                            totalPages={Math.ceil(
                              documents.length / itemsPerPage,
                            )}
                            onPageChange={setDocumentsPage}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Бічна панель із статистикою */}
          <div className="detail-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Статистика</h3>
              </div>
              <div className="card-body">
                <div className="stat-item">
                  <FiAward className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-label">Патенти</span>
                    <span className="stat-value">{patents.length}</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FiFileText className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-label">Документи</span>
                    <span className="stat-value">{documents.length}</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FiFolder className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-label">Підкатегорії</span>
                    <span className="stat-value">{subcategories.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
