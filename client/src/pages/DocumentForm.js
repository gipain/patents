import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { documentsAPI, authorsAPI, categoriesAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./PatentForm.css";

const DocumentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    documentType: "article",
    publicationYear: new Date().getFullYear(),
    publicationDate: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    publisher: "",
    doi: "",
    isbn: "",
    issn: "",
    language: "uk",
    keywords: "",
    references: "",
    categoryId: "",
    authors: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          categoriesAPI.getAll(),
          authorsAPI.getAll({ limit: 100 }),
        ]);

        // Категорії можуть бути масивом або об'єктом з data
        const categoriesData =
          categoriesRes.data.data || categoriesRes.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Автори повертаються як {authors: [...]}
        const authorsData =
          authorsRes.data.authors ||
          authorsRes.data.data ||
          authorsRes.data ||
          [];
        setAllAuthors(Array.isArray(authorsData) ? authorsData : []);

        if (isEdit) {
          const docRes = await documentsAPI.getById(id);
          const doc = docRes.data;
          setFormData({
            title: doc.title || "",
            abstract: doc.abstract || "",
            content: doc.content || "",
            documentType: doc.documentType || "article",
            publicationYear: doc.publicationYear || new Date().getFullYear(),
            publicationDate: doc.publicationDate
              ? doc.publicationDate.split("T")[0]
              : "",
            journal: doc.journal || "",
            volume: doc.volume || "",
            issue: doc.issue || "",
            pages: doc.pages || "",
            publisher: doc.publisher || "",
            doi: doc.doi || "",
            isbn: doc.isbn || "",
            issn: doc.issn || "",
            language: doc.language || "uk",
            keywords: doc.keywords || "",
            references: doc.references || "",
            categoryId: doc.categoryId || "",
            authors: doc.authors ? doc.authors.map((a) => a.id) : [],
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAuthorToggle = (authorId) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.includes(authorId)
        ? prev.authors.filter((id) => id !== authorId)
        : [...prev.authors, authorId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Введіть назву документа");
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        publicationYear: parseInt(formData.publicationYear),
      };

      if (isEdit) {
        await documentsAPI.update(id, dataToSend);
        toast.success("Документ оновлено");
      } else {
        await documentsAPI.create(dataToSend);
        toast.success("Документ створено");
      }
      navigate("/documents");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="patent-form-page">
      <div className="container">
        <div className="form-header">
          <Link to="/documents" className="back-link">
            <FiArrowLeft /> Назад до документів
          </Link>
          <h1>{isEdit ? "Редагування документа" : "Новий документ"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="patent-form">
          <div className="form-grid">
            {/* Основна інформація */}
            <div className="card form-section">
              <div className="card-header">
                <h3>Основна інформація</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="documentType">Тип документа</label>
                    <select
                      id="documentType"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                    >
                      <option value="article">Наукова стаття</option>
                      <option value="thesis">Дисертація</option>
                      <option value="report">Науковий звіт</option>
                      <option value="book">Книга</option>
                      <option value="conference">Матеріали конференції</option>
                      <option value="manual">Навчальний посібник</option>
                      <option value="standard">Стандарт</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="language">Мова</label>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                    >
                      <option value="uk">Українська</option>
                      <option value="en">Англійська</option>
                      <option value="de">Німецька</option>
                      <option value="fr">Французька</option>
                      <option value="ru">Російська</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Назва *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Введіть назву документа"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="abstract">Анотація</label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Короткий опис документа"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Зміст</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Повний текст документа"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="references">Список літератури</label>
                  <textarea
                    id="references"
                    name="references"
                    value={formData.references}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Список використаних джерел"
                  />
                </div>
              </div>
            </div>

            {/* Публікація */}
            <div className="card form-section">
              <div className="card-header">
                <h3>Інформація про публікацію</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="publicationYear">Рік публікації</label>
                    <input
                      type="number"
                      id="publicationYear"
                      name="publicationYear"
                      value={formData.publicationYear}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="publicationDate">Дата публікації</label>
                    <input
                      type="date"
                      id="publicationDate"
                      name="publicationDate"
                      value={formData.publicationDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="journal">Журнал / Видання</label>
                  <input
                    type="text"
                    id="journal"
                    name="journal"
                    value={formData.journal}
                    onChange={handleChange}
                    placeholder="Назва журналу або видання"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="volume">Том</label>
                    <input
                      type="text"
                      id="volume"
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="issue">Номер</label>
                    <input
                      type="text"
                      id="issue"
                      name="issue"
                      value={formData.issue}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pages">Сторінки</label>
                    <input
                      type="text"
                      id="pages"
                      name="pages"
                      value={formData.pages}
                      onChange={handleChange}
                      placeholder="напр. 15-28"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="publisher">Видавництво</label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="Назва видавництва"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="doi">DOI</label>
                    <input
                      type="text"
                      id="doi"
                      name="doi"
                      value={formData.doi}
                      onChange={handleChange}
                      placeholder="10.xxxx/xxxxx"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="isbn">ISBN</label>
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="978-x-xxx-xxxxx-x"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="issn">ISSN</label>
                    <input
                      type="text"
                      id="issn"
                      name="issn"
                      value={formData.issn}
                      onChange={handleChange}
                      placeholder="xxxx-xxxx"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="categoryId">Категорія</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Оберіть категорію</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="keywords">Ключові слова</label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="Через кому: наука, дослідження, аналіз"
                  />
                </div>
              </div>
            </div>

            {/* Автори */}
            <div className="card form-section full-width">
              <div className="card-header">
                <h3>Автори</h3>
              </div>
              <div className="card-body">
                <div className="authors-select">
                  {allAuthors.map((author) => (
                    <label
                      key={author.id}
                      className={`author-checkbox ${
                        formData.authors.includes(author.id) ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.authors.includes(author.id)}
                        onChange={() => handleAuthorToggle(author.id)}
                      />
                      <span>
                        {author.lastName} {author.firstName}{" "}
                        {author.middleName || ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="btn btn-outline"
            >
              <FiX /> Скасувати
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FiSave />{" "}
              {saving ? "Збереження..." : isEdit ? "Зберегти" : "Створити"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
