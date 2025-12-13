import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiFolder,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiAward,
  FiChevronRight,
} from "react-icons/fi";
import { categoriesAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data || response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Помилка завантаження категорій");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю категорію?")) {
      try {
        await categoriesAPI.delete(id);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        toast.success("Категорію видалено");
      } catch (error) {
        const message = error.response?.data?.message || "Помилка видалення";
        toast.error(message);
      }
    }
  };

  // Групування категорій за батьківськими
  const rootCategories = categories.filter((cat) => !cat.parentId);
  const getChildren = (parentId) =>
    categories.filter((cat) => cat.parentId === parentId);

  if (loading) return <Loading />;

  return (
    <div className="categories-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              <FiFolder /> Категорії
            </h1>
            <p>Класифікація патентів та документів за галузями</p>
          </div>
          <Link to="/categories/new" className="btn btn-primary">
            <FiPlus /> Додати категорію
          </Link>
        </div>

        <div className="categories-stats">
          <div className="stat-card">
            <FiFolder size={24} />
            <div className="stat-content">
              <span className="stat-value">{categories.length}</span>
              <span className="stat-label">Всього категорій</span>
            </div>
          </div>
          <div className="stat-card">
            <FiAward size={24} />
            <div className="stat-content">
              <span className="stat-value">
                {categories.reduce(
                  (sum, cat) => sum + (cat.patentsCount || 0),
                  0,
                )}
              </span>
              <span className="stat-label">Патентів</span>
            </div>
          </div>
          <div className="stat-card">
            <FiFileText size={24} />
            <div className="stat-content">
              <span className="stat-value">
                {categories.reduce(
                  (sum, cat) => sum + (cat.documentsCount || 0),
                  0,
                )}
              </span>
              <span className="stat-label">Документів</span>
            </div>
          </div>
        </div>

        <div className="categories-list">
          {rootCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              children={getChildren(category.id)}
              allCategories={categories}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <FiFolder size={48} />
            <h3>Категорій ще немає</h3>
            <p>Створіть першу категорію для класифікації матеріалів</p>
            <Link to="/categories/new" className="btn btn-primary">
              <FiPlus /> Створити категорію
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryItem = ({
  category,
  children,
  allCategories,
  onDelete,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children && children.length > 0;
  const getChildren = (parentId) =>
    allCategories.filter((cat) => cat.parentId === parentId);

  return (
    <div className={`category-item level-${level}`}>
      <div className="category-card">
        <div className="category-main">
          {hasChildren && (
            <button
              className={`expand-btn ${expanded ? "expanded" : ""}`}
              onClick={() => setExpanded(!expanded)}
            >
              <FiChevronRight />
            </button>
          )}

          <div className="category-icon">
            <FiFolder />
          </div>

          <div className="category-info">
            <h3>
              <Link to={`/categories/${category.id}`}>{category.name}</Link>
            </h3>
            {category.code && (
              <span className="category-code">{category.code}</span>
            )}
            {category.description && (
              <p className="category-desc">{category.description}</p>
            )}
          </div>
        </div>

        <div className="category-stats">
          <div className="mini-stat">
            <FiAward />
            <span>{category.patentsCount || 0}</span>
          </div>
          <div className="mini-stat">
            <FiFileText />
            <span>{category.documentsCount || 0}</span>
          </div>
        </div>

        <div className="category-actions">
          <Link
            to={`/categories/${category.id}/edit`}
            className="btn btn-sm btn-outline"
          >
            <FiEdit />
          </Link>
          <button
            onClick={() => onDelete(category.id)}
            className="btn btn-sm btn-danger"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="category-children">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              children={getChildren(child.id)}
              allCategories={allCategories}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
