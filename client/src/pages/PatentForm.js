import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { patentsAPI, authorsAPI, categoriesAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./PatentForm.css";

const PatentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    number: "",
    abstract: "",
    description: "",
    claims: "",
    status: "pending",
    patentType: "invention",
    filingDate: "",
    publicationDate: "",
    grantDate: "",
    expirationDate: "",
    ipcCode: "",
    country: "UA",
    applicant: "",
    priority: "",
    keywords: "",
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
          const patentRes = await patentsAPI.getById(id);
          const patent = patentRes.data;
          setFormData({
            title: patent.title || "",
            number: patent.number || "",
            abstract: patent.abstract || "",
            description: patent.description || "",
            claims: patent.claims || "",
            status: patent.status || "pending",
            patentType: patent.patentType || "invention",
            filingDate: patent.filingDate
              ? patent.filingDate.split("T")[0]
              : "",
            publicationDate: patent.publicationDate
              ? patent.publicationDate.split("T")[0]
              : "",
            grantDate: patent.grantDate ? patent.grantDate.split("T")[0] : "",
            expirationDate: patent.expirationDate
              ? patent.expirationDate.split("T")[0]
              : "",
            ipcCode: patent.ipcCode || "",
            country: patent.country || "UA",
            applicant: patent.applicant || "",
            priority: patent.priority || "",
            keywords: patent.keywords || "",
            categoryId: patent.categoryId || "",
            authors: patent.authors ? patent.authors.map((a) => a.id) : [],
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

    if (!formData.title || !formData.number) {
      toast.error("Заповніть обов'язкові поля");
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };

      if (isEdit) {
        await patentsAPI.update(id, dataToSend);
        toast.success("Патент оновлено");
      } else {
        await patentsAPI.create(dataToSend);
        toast.success("Патент створено");
      }
      navigate("/patents");
    } catch (error) {
      console.error("Error saving patent:", error);
      toast.error("Помилка збереження патенту");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="patent-form-page">
      <div className="container">
        <div className="form-header">
          <Link to="/patents" className="back-link">
            <FiArrowLeft /> Назад до патентів
          </Link>
          <h1>{isEdit ? "Редагування патенту" : "Новий патент"}</h1>
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
                    <label htmlFor="number">Номер патенту *</label>
                    <input
                      type="text"
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="UA 123456"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patentType">Тип</label>
                    <select
                      id="patentType"
                      name="patentType"
                      value={formData.patentType}
                      onChange={handleChange}
                    >
                      <option value="invention">Винахід</option>
                      <option value="utility_model">Корисна модель</option>
                      <option value="design">Промисловий зразок</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Статус</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="pending">Очікує</option>
                      <option value="granted">Діючий</option>
                      <option value="expired">Закінчився</option>
                      <option value="rejected">Відхилено</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Назва патенту *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Введіть назву патенту"
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
                    placeholder="Короткий опис винаходу"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Опис</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Детальний опис винаходу"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="claims">Формула винаходу</label>
                  <textarea
                    id="claims"
                    name="claims"
                    value={formData.claims}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Формула патенту"
                  />
                </div>
              </div>
            </div>

            {/* Дати та класифікація */}
            <div className="card form-section">
              <div className="card-header">
                <h3>Дати та класифікація</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="filingDate">Дата подання</label>
                    <input
                      type="date"
                      id="filingDate"
                      name="filingDate"
                      value={formData.filingDate}
                      onChange={handleChange}
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="grantDate">Дата видачі</label>
                    <input
                      type="date"
                      id="grantDate"
                      name="grantDate"
                      value={formData.grantDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expirationDate">Дата закінчення</label>
                    <input
                      type="date"
                      id="expirationDate"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ipcCode">IPC код</label>
                    <input
                      type="text"
                      id="ipcCode"
                      name="ipcCode"
                      value={formData.ipcCode}
                      onChange={handleChange}
                      placeholder="A01B 1/00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Країна</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="UA">Україна</option>
                      <option value="US">США</option>
                      <option value="EP">Європа</option>
                      <option value="WO">Міжнародний (WIPO)</option>
                      <option value="DE">Німеччина</option>
                      <option value="JP">Японія</option>
                      <option value="CN">Китай</option>
                    </select>
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
                  <label htmlFor="applicant">Заявник</label>
                  <input
                    type="text"
                    id="applicant"
                    name="applicant"
                    value={formData.applicant}
                    onChange={handleChange}
                    placeholder="Назва організації-заявника"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="keywords">Ключові слова</label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="Через кому: інновація, технологія, пристрій"
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
              onClick={() => navigate("/patents")}
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

export default PatentForm;
