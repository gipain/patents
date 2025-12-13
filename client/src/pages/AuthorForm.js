import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { authorsAPI } from '../services/api';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import './PatentForm.css';

const AuthorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    degree: '',
    position: '',
    specialization: '',
    website: '',
    orcid: '',
    bio: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchAuthor = async () => {
        try {
          const response = await authorsAPI.getById(id);
          const author = response.data;
          setFormData({
            firstName: author.firstName || '',
            lastName: author.lastName || '',
            middleName: author.middleName || '',
            email: author.email || '',
            phone: author.phone || '',
            degree: author.degree || '',
            position: author.position || '',
            specialization: author.specialization || '',
            website: author.website || '',
            orcid: author.orcid || '',
            bio: author.bio || ''
          });
        } catch (error) {
          console.error('Error fetching author:', error);
          toast.error('Помилка завантаження даних');
        } finally {
          setLoading(false);
        }
      };
      fetchAuthor();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      toast.error('Введіть ім\'я та прізвище');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await authorsAPI.update(id, formData);
        toast.success('Автора оновлено');
      } else {
        await authorsAPI.create(formData);
        toast.success('Автора створено');
      }
      navigate('/authors');
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="patent-form-page">
      <div className="container">
        <div className="form-header">
          <Link to="/authors" className="back-link">
            <FiArrowLeft /> Назад до авторів
          </Link>
          <h1>{isEdit ? 'Редагування автора' : 'Новий автор'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="patent-form">
          <div className="form-grid">
            {/* Особисті дані */}
            <div className="card form-section">
              <div className="card-header">
                <h3>Особисті дані</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="lastName">Прізвище *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Введіть прізвище"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="firstName">Ім'я *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Введіть ім'я"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="middleName">По батькові</label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Введіть по батькові"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Біографія</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Коротка біографія автора"
                  />
                </div>
              </div>
            </div>

            {/* Професійна інформація */}
            <div className="card form-section">
              <div className="card-header">
                <h3>Професійна інформація</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="degree">Науковий ступінь</label>
                  <select
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                  >
                    <option value="">Оберіть ступінь</option>
                    <option value="к.т.н.">Кандидат технічних наук</option>
                    <option value="д.т.н.">Доктор технічних наук</option>
                    <option value="к.ф.-м.н.">Кандидат фізико-математичних наук</option>
                    <option value="д.ф.-м.н.">Доктор фізико-математичних наук</option>
                    <option value="к.е.н.">Кандидат економічних наук</option>
                    <option value="д.е.н.">Доктор економічних наук</option>
                    <option value="к.б.н.">Кандидат біологічних наук</option>
                    <option value="д.б.н.">Доктор біологічних наук</option>
                    <option value="PhD">PhD</option>
                    <option value="Dr.Sc.">Doctor of Science</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="position">Посада</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="напр. Професор кафедри інформатики"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">Спеціалізація</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="напр. Комп'ютерні науки, штучний інтелект"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orcid">ORCID</label>
                  <input
                    type="text"
                    id="orcid"
                    name="orcid"
                    value={formData.orcid}
                    onChange={handleChange}
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Контакти */}
            <div className="card form-section full-width">
              <div className="card-header">
                <h3>Контактна інформація</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+380 XX XXX XX XX"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Вебсайт</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/authors')} className="btn btn-outline">
              <FiX /> Скасувати
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FiSave /> {saving ? 'Збереження...' : (isEdit ? 'Зберегти' : 'Створити')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorForm;
