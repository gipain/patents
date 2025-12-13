import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiBookmark,
  FiShare2,
  FiDownload,
  FiCalendar,
  FiUser,
  FiFolder,
  FiTag,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { patentsAPI, bookmarksAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./PatentDetail.css";

// Компонент для розгортання тексту
const ExpandableSection = ({ title, content, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success("Скопійовано до буферу обміну");
  };

  if (!content) return null;

  return (
    <section className="detail-section expandable">
      <div className="section-header">
        <h3
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer" }}
        >
          {expanded ? <FiChevronUp /> : <FiChevronDown />} {title}
        </h3>
        <button
          className="btn-icon"
          onClick={copyToClipboard}
          title="Копіювати"
        >
          <FiCopy />
        </button>
      </div>
      {expanded && (
        <div className="section-content">
          {title === "Формула винаходу" ? (
            <pre className="claims-text">{content}</pre>
          ) : (
            <p className="full-text">{content}</p>
          )}
        </div>
      )}
    </section>
  );
};

const PatentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patent, setPatent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatent = async () => {
      try {
        const response = await patentsAPI.getById(id);
        setPatent(response.data);
      } catch (error) {
        console.error("Error fetching patent:", error);
        toast.error("Помилка завантаження патенту");
      } finally {
        setLoading(false);
      }
    };

    fetchPatent();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цей патент?")) {
      try {
        await patentsAPI.delete(id);
        toast.success("Патент видалено");
        navigate("/patents");
      } catch (error) {
        toast.error("Помилка видалення патенту");
      }
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarksAPI.add({ itemType: "patent", itemId: parseInt(id) });
      toast.success("Додано до закладок");
    } catch (error) {
      if (error.response?.data?.message === "Закладка вже існує") {
        toast.info("Вже в закладках");
      } else {
        toast.error("Помилка додавання до закладок");
      }
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      granted: {
        class: "success",
        text: "Діючий",
        description: "Патент видано та діє",
      },
      pending: {
        class: "warning",
        text: "Очікує",
        description: "Заявка на розгляді",
      },
      expired: {
        class: "secondary",
        text: "Закінчився",
        description: "Термін дії патенту закінчився",
      },
      rejected: {
        class: "danger",
        text: "Відхилено",
        description: "Заявку відхилено",
      },
    };
    return (
      statusMap[status] || { class: "secondary", text: status, description: "" }
    );
  };

  const getTypeText = (type) => {
    const typeMap = {
      invention: "Винахід",
      utility_model: "Корисна модель",
      design: "Промисловий зразок",
    };
    return typeMap[type] || type;
  };

  if (loading) return <Loading />;
  if (!patent)
    return (
      <div className="container">
        <p>Патент не знайдено</p>
      </div>
    );

  const statusInfo = getStatusInfo(patent.status);

  return (
    <div className="patent-detail">
      <div className="container">
        <div className="detail-header">
          <Link to="/patents" className="back-link">
            <FiArrowLeft /> Назад до патентів
          </Link>

          <div className="detail-actions">
            <button onClick={handleBookmark} className="btn btn-outline">
              <FiBookmark /> Закладка
            </button>
            <button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
              className="btn btn-outline"
            >
              <FiShare2 /> Поділитися
            </button>
            <Link to={`/patents/${id}/edit`} className="btn btn-outline">
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
                <div className="patent-meta-top">
                  <span className="patent-number">{patent.number}</span>
                  <span className={`badge badge-${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                  <span className="patent-type">
                    {getTypeText(patent.patentType)}
                  </span>
                </div>

                <h1 className="patent-title">{patent.title}</h1>

                <ExpandableSection
                  title="Анотація"
                  content={patent.abstract}
                  defaultExpanded={true}
                />

                <ExpandableSection
                  title="Опис винаходу"
                  content={patent.description}
                  defaultExpanded={true}
                />

                <ExpandableSection
                  title="Формула винаходу"
                  content={patent.claims}
                  defaultExpanded={true}
                />
              </div>
            </div>

            {/* Цитовані патенти */}
            {patent.citedPatents && patent.citedPatents.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>Цитовані патенти</h3>
                </div>
                <div className="card-body">
                  <ul className="cited-list">
                    {patent.citedPatents.map((cited) => (
                      <li key={cited.id}>
                        <Link to={`/patents/${cited.id}`}>
                          {cited.number} - {cited.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="detail-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Інформація</h3>
              </div>
              <div className="card-body">
                <dl className="info-list">
                  {patent.ipcCode && (
                    <>
                      <dt>
                        <FiTag /> IPC код
                      </dt>
                      <dd>{patent.ipcCode}</dd>
                    </>
                  )}

                  {patent.filingDate && (
                    <>
                      <dt>
                        <FiCalendar /> Дата подання
                      </dt>
                      <dd>
                        {new Date(patent.filingDate).toLocaleDateString(
                          "uk-UA",
                        )}
                      </dd>
                    </>
                  )}

                  {patent.publicationDate && (
                    <>
                      <dt>
                        <FiCalendar /> Дата публікації
                      </dt>
                      <dd>
                        {new Date(patent.publicationDate).toLocaleDateString(
                          "uk-UA",
                        )}
                      </dd>
                    </>
                  )}

                  {patent.grantDate && (
                    <>
                      <dt>
                        <FiCalendar /> Дата видачі
                      </dt>
                      <dd>
                        {new Date(patent.grantDate).toLocaleDateString("uk-UA")}
                      </dd>
                    </>
                  )}

                  {patent.expirationDate && (
                    <>
                      <dt>
                        <FiCalendar /> Дата закінчення
                      </dt>
                      <dd>
                        {new Date(patent.expirationDate).toLocaleDateString(
                          "uk-UA",
                        )}
                      </dd>
                    </>
                  )}

                  <dt>Країна</dt>
                  <dd>{patent.country}</dd>

                  {patent.applicant && (
                    <>
                      <dt>Заявник</dt>
                      <dd>{patent.applicant}</dd>
                    </>
                  )}

                  <dt>Переглядів</dt>
                  <dd>{patent.viewCount}</dd>
                </dl>
              </div>
            </div>

            {patent.authors && patent.authors.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>
                    <FiUser /> Автори
                  </h3>
                </div>
                <div className="card-body">
                  <ul className="authors-list">
                    {patent.authors.map((author) => (
                      <li key={author.id}>
                        <Link to={`/authors/${author.id}`}>
                          {author.lastName} {author.firstName}{" "}
                          {author.middleName || ""}
                        </Link>
                        {author.organization && (
                          <span className="author-org">
                            {author.organization.shortName ||
                              author.organization.name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {patent.category && (
              <div className="card">
                <div className="card-header">
                  <h3>
                    <FiFolder /> Категорія
                  </h3>
                </div>
                <div className="card-body">
                  <Link
                    to={`/categories/${patent.category.id}`}
                    className="category-link"
                  >
                    {patent.category.name}
                  </Link>
                  {patent.category.code && (
                    <span className="category-code">
                      {patent.category.code}
                    </span>
                  )}
                </div>
              </div>
            )}

            {patent.keywords && (
              <div className="card">
                <div className="card-header">
                  <h3>Ключові слова</h3>
                </div>
                <div className="card-body">
                  <div className="tags">
                    {patent.keywords.split(",").map((keyword, index) => (
                      <span key={index} className="tag">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentDetail;
