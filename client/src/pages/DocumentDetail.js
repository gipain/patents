import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiBookmark,
  FiDownload,
  FiCalendar,
  FiUser,
  FiFolder,
  FiBook,
  FiExternalLink,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { documentsAPI, bookmarksAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./DocumentDetail.css";

// Компонент для розгортання тексту
const ExpandableSection = ({
  title,
  content,
  isPreformatted = false,
  defaultExpanded = true,
}) => {
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
          {isPreformatted ? (
            <pre className="references-text">{content}</pre>
          ) : (
            <div className="full-text">{content}</div>
          )}
        </div>
      )}
    </section>
  );
};

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await documentsAPI.getById(id);
        setDocument(response.data);
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Помилка завантаження документа");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цей документ?")) {
      try {
        await documentsAPI.delete(id);
        toast.success("Документ видалено");
        navigate("/documents");
      } catch (error) {
        toast.error("Помилка видалення документа");
      }
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarksAPI.add({ itemType: "document", itemId: parseInt(id) });
      toast.success("Додано до закладок");
    } catch (error) {
      if (error.response?.data?.message === "Закладка вже існує") {
        toast.info("Вже в закладках");
      } else {
        toast.error("Помилка додавання до закладок");
      }
    }
  };

  const getDocTypeText = (type) => {
    const typeMap = {
      article: "Наукова стаття",
      thesis: "Дисертація",
      report: "Науковий звіт",
      book: "Книга",
      conference: "Матеріали конференції",
      manual: "Навчальний посібник",
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

  if (loading) return <Loading />;
  if (!document)
    return (
      <div className="container">
        <p>Документ не знайдено</p>
      </div>
    );

  return (
    <div className="document-detail">
      <div className="container">
        <div className="detail-header">
          <Link to="/documents" className="back-link">
            <FiArrowLeft /> Назад до документів
          </Link>

          <div className="detail-actions">
            <button onClick={handleBookmark} className="btn btn-outline">
              <FiBookmark /> Закладка
            </button>
            {document.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <FiDownload /> Завантажити
              </a>
            )}
            <Link to={`/documents/${id}/edit`} className="btn btn-outline">
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
                <div className="document-meta-top">
                  <span
                    className={`doc-type-badge badge-${getDocTypeClass(
                      document.docType,
                    )}`}
                  >
                    {getDocTypeText(document.docType)}
                  </span>
                  {document.publicationYear && (
                    <span className="document-year">
                      {document.publicationYear}
                    </span>
                  )}
                </div>

                <h1 className="document-title">{document.title}</h1>

                {document.authors && document.authors.length > 0 && (
                  <div className="document-authors-inline">
                    {document.authors.map((author, index) => (
                      <React.Fragment key={author.id}>
                        <Link to={`/authors/${author.id}`}>
                          {author.lastName} {author.firstName}{" "}
                          {author.middleName || ""}
                        </Link>
                        {index < document.authors.length - 1 && ", "}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {document.journal && (
                  <div className="publication-info">
                    <FiBook />
                    <span>{document.journal}</span>
                    {document.volume && <span>, Vol. {document.volume}</span>}
                    {document.issue && <span>, No. {document.issue}</span>}
                    {document.pages && <span>, pp. {document.pages}</span>}
                  </div>
                )}

                <ExpandableSection
                  title="Анотація"
                  content={document.abstract}
                  defaultExpanded={true}
                />

                <ExpandableSection
                  title="Повний зміст"
                  content={document.content}
                  defaultExpanded={true}
                />

                <ExpandableSection
                  title="Список літератури"
                  content={document.references}
                  isPreformatted={true}
                  defaultExpanded={false}
                />
              </div>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Інформація</h3>
              </div>
              <div className="card-body">
                <dl className="info-list">
                  {document.doi && (
                    <>
                      <dt>DOI</dt>
                      <dd>
                        <a
                          href={`https://doi.org/${document.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {document.doi} <FiExternalLink size={12} />
                        </a>
                      </dd>
                    </>
                  )}

                  {document.isbn && (
                    <>
                      <dt>ISBN</dt>
                      <dd>{document.isbn}</dd>
                    </>
                  )}

                  {document.issn && (
                    <>
                      <dt>ISSN</dt>
                      <dd>{document.issn}</dd>
                    </>
                  )}

                  {document.publicationDate && (
                    <>
                      <dt>
                        <FiCalendar /> Дата публікації
                      </dt>
                      <dd>
                        {new Date(document.publicationDate).toLocaleDateString(
                          "uk-UA",
                        )}
                      </dd>
                    </>
                  )}

                  {document.publisher && (
                    <>
                      <dt>Видавництво</dt>
                      <dd>{document.publisher}</dd>
                    </>
                  )}

                  {document.language && (
                    <>
                      <dt>Мова</dt>
                      <dd>{document.language}</dd>
                    </>
                  )}

                  <dt>Переглядів</dt>
                  <dd>{document.viewCount || 0}</dd>
                </dl>
              </div>
            </div>

            {document.authors && document.authors.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>
                    <FiUser /> Автори
                  </h3>
                </div>
                <div className="card-body">
                  <ul className="authors-list">
                    {document.authors.map((author) => (
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

            {document.category && (
              <div className="card">
                <div className="card-header">
                  <h3>
                    <FiFolder /> Категорія
                  </h3>
                </div>
                <div className="card-body">
                  <Link
                    to={`/categories/${document.category.id}`}
                    className="category-link"
                  >
                    {document.category.name}
                  </Link>
                </div>
              </div>
            )}

            {document.keywords && (
              <div className="card">
                <div className="card-header">
                  <h3>Ключові слова</h3>
                </div>
                <div className="card-body">
                  <div className="tags">
                    {document.keywords.split(",").map((keyword, index) => (
                      <span key={index} className="tag">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {document.relatedPatents && document.relatedPatents.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>Пов'язані патенти</h3>
                </div>
                <div className="card-body">
                  <ul className="related-list">
                    {document.relatedPatents.map((patent) => (
                      <li key={patent.id}>
                        <Link to={`/patents/${patent.id}`}>
                          {patent.number} - {patent.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
