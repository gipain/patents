import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiFolder } from "react-icons/fi";
import { categoriesAPI } from "../services/api";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import "./CategoryForm.css";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentId: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Завантажуємо всі категорії для вибору батьківської
        const categoriesRes = await categoriesAPI.getAllFlat();
        setCategories(categoriesRes.data || []);

        // Якщо редагуємо, завантажуємо дані категорії
        if (isEdit) {
          const categoryRes = await categoriesAPI.getById(id);
          const category = categoryRes.data.data || categoryRes.data;
          setFormData({
            name: category.name || "",
            code: category.code || "",
            description: category.description || "",
            parentId: category.parentId || "",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Введіть назву категорії");
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
      };

      if (isEdit) {
        await categoriesAPI.update(id, dataToSend);
        toast.success("Категорію оновлено");
      } else {
        await categoriesAPI.create(dataToSend);
        toast.success("Категорію створено");
      }
      navigate("/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  // Фільтруємо категорії, щоб не можна було обрати себе як батьківську
  const availableParents = categories.filter((cat) => cat.id !== parseInt(id));

  return (
    <div className="category-form-page">
      <div className="container">
        <div className="page-header">
          <button
            onClick={() => navigate("/categories")}
            className="btn btn-outline"
          >
            <FiArrowLeft /> Назад
          </button>
          <h1>
            <FiFolder /> {isEdit ? "Редагувати категорію" : "Нова категорія"}
          </h1>
        </div>

        <div className="form-card card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Назва категорії *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Введіть назву категорії"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">Код категорії</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Наприклад: IT, MECH, CHEM"
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentId">Батьківська категорія</label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- Немає (коренева категорія) --</option>
                  {availableParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Опис</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="4"
                  placeholder="Опис категорії..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/categories")}
                  className="btn btn-outline"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <FiSave />{" "}
                  {saving
                    ? "Збереження..."
                    : isEdit
                    ? "Зберегти зміни"
                    : "Створити"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
