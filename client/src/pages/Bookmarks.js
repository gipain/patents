import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBookmark,
  FiTrash2,
  FiFileText,
  FiAward,
  FiUser,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import { bookmarksAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./Bookmarks.css";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarksAPI.getAll();
      setBookmarks(response.data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Помилка завантаження закладок");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (id) => {
    if (!window.confirm("Видалити цю закладку?")) return;

    try {
      await bookmarksAPI.remove(id);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
      toast.success("Закладку видалено");
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Помилка видалення закладки");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "patent":
        return <FiAward />;
      case "document":
        return <FiFileText />;
      case "author":
        return <FiUser />;
      default:
        return <FiBookmark />;
    }
  };

  const getLink = (bookmark) => {
    switch (bookmark.itemType) {
      case "patent":
        return `/patents/${bookmark.itemId}`;
      case "document":
        return `/documents/${bookmark.itemId}`;
      case "author":
        return `/authors/${bookmark.itemId}`;
      default:
        return "#";
    }
  };

  const getTitle = (bookmark) => {
    if (!bookmark.item) return "Елемент не знайдено";

    if (bookmark.itemType === "patent") {
      return `${bookmark.item.number} - ${bookmark.item.title}`;
    }
    if (bookmark.itemType === "document") {
      return bookmark.item.title;
    }
    if (bookmark.itemType === "author") {
      return `${bookmark.item.lastName} ${bookmark.item.firstName} ${
        bookmark.item.middleName || ""
      }`;
    }
    return "Невідомий елемент";
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "patent":
        return "Патент";
      case "document":
        return "Документ";
      case "author":
        return "Автор";
      default:
        return type;
    }
  };

  const filteredBookmarks =
    filter === "all"
      ? bookmarks
      : bookmarks.filter((b) => b.itemType === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="bookmarks-page">
      <div className="container">
        <div className="page-header">
          <h1>
            <FiBookmark /> Мої закладки
          </h1>
          <p>Збережені патенти, документи та автори</p>
        </div>

        {/* Фільтри */}
        <div className="bookmarks-filters">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Всі ({bookmarks.length})
          </button>
          <button
            className={`filter-btn ${filter === "patent" ? "active" : ""}`}
            onClick={() => setFilter("patent")}
          >
            <FiAward /> Патенти (
            {bookmarks.filter((b) => b.itemType === "patent").length})
          </button>
          <button
            className={`filter-btn ${filter === "document" ? "active" : ""}`}
            onClick={() => setFilter("document")}
          >
            <FiFileText /> Документи (
            {bookmarks.filter((b) => b.itemType === "document").length})
          </button>
          <button
            className={`filter-btn ${filter === "author" ? "active" : ""}`}
            onClick={() => setFilter("author")}
          >
            <FiUser /> Автори (
            {bookmarks.filter((b) => b.itemType === "author").length})
          </button>
        </div>

        {/* Список закладок */}
        {filteredBookmarks.length > 0 ? (
          <div className="bookmarks-list">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-card">
                <div className="bookmark-icon">
                  {getIcon(bookmark.itemType)}
                </div>
                <div className="bookmark-content">
                  <span className="bookmark-type">
                    {getTypeLabel(bookmark.itemType)}
                  </span>
                  <Link to={getLink(bookmark)} className="bookmark-title">
                    {getTitle(bookmark)}
                  </Link>
                  {bookmark.notes && (
                    <p className="bookmark-notes">{bookmark.notes}</p>
                  )}
                  <div className="bookmark-meta">
                    <span>
                      <FiCalendar /> Додано: {formatDate(bookmark.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="bookmark-actions">
                  <Link
                    to={getLink(bookmark)}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Переглянути
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    title="Видалити закладку"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookmarks">
            <FiBookmark size={48} />
            <h3>Закладок поки немає</h3>
            <p>
              Додавайте патенти, документи та авторів до закладок для швидкого
              доступу
            </p>
            <div className="no-bookmarks-actions">
              <Link to="/patents" className="btn btn-primary">
                <FiAward /> Переглянути патенти
              </Link>
              <Link to="/documents" className="btn btn-outline-primary">
                <FiFileText /> Переглянути документи
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
