import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiMail, FiPhone, FiGlobe, FiMapPin, FiFileText, FiAward } from 'react-icons/fi';
import { authorsAPI } from '../services/api';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import './AuthorDetail.css';

const AuthorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await authorsAPI.getById(id);
        setAuthor(response.data);
      } catch (error) {
        console.error('Error fetching author:', error);
        toast.error('Помилка завантаження автора');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити цього автора?')) {
      try {
        await authorsAPI.delete(id);
        toast.success('Автора видалено');
        navigate('/authors');
      } catch (error) {
        toast.error('Помилка видалення');
      }
    }
  };

  const getInitials = (author) => {
    return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
  };

  if (loading) return <Loading />;
  if (!author) return <div className="container"><p>Автора не знайдено</p></div>;

  return (
    <div className="author-detail">
      <div className="container">
        <div className="detail-header">
          <Link to="/authors" className="back-link">
            <FiArrowLeft /> Назад до авторів
          </Link>
          
          <div className="detail-actions">
            <Link to={`/authors/${id}/edit`} className="btn btn-outline">
              <FiEdit /> Редагувати
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <FiTrash2 /> Видалити
            </button>
          </div>
        </div>

        <div className="author-profile">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(author)}
            </div>
            
            <div className="profile-info">
              <h1>{author.lastName} {author.firstName} {author.middleName || ''}</h1>
              
              {author.degree && (
                <p className="profile-degree">{author.degree}</p>
              )}
              
              {author.position && (
                <p className="profile-position">{author.position}</p>
              )}
              
              {author.organization && (
                <p className="profile-org">
                  <FiMapPin />
                  {author.organization.name}
                </p>
              )}
            </div>
          </div>

          <div className="profile-contacts">
            {author.email && (
              <a href={`mailto:${author.email}`} className="contact-item">
                <FiMail />
                <span>{author.email}</span>
              </a>
            )}
            
            {author.phone && (
              <a href={`tel:${author.phone}`} className="contact-item">
                <FiPhone />
                <span>{author.phone}</span>
              </a>
            )}
            
            {author.website && (
              <a href={author.website} target="_blank" rel="noopener noreferrer" className="contact-item">
                <FiGlobe />
                <span>{author.website}</span>
              </a>
            )}
          </div>

          {author.bio && (
            <div className="profile-bio">
              <h3>Біографія</h3>
              <p>{author.bio}</p>
            </div>
          )}

          <div className="profile-stats">
            <div className="stat-card">
              <FiAward size={24} />
              <span className="stat-value">{author.patents?.length || 0}</span>
              <span className="stat-label">Патентів</span>
            </div>
            <div className="stat-card">
              <FiFileText size={24} />
              <span className="stat-value">{author.documents?.length || 0}</span>
              <span className="stat-label">Публікацій</span>
            </div>
          </div>
        </div>

        <div className="author-works">
          {/* Патенти */}
          {author.patents && author.patents.length > 0 && (
            <div className="works-section">
              <h2><FiAward /> Патенти ({author.patents.length})</h2>
              <div className="works-list">
                {author.patents.map(patent => (
                  <Link to={`/patents/${patent.id}`} key={patent.id} className="work-card">
                    <div className="work-meta">
                      <span className="work-number">{patent.number}</span>
                      <span className={`badge badge-${patent.status === 'granted' ? 'success' : 'warning'}`}>
                        {patent.status === 'granted' ? 'Діючий' : 'Очікує'}
                      </span>
                    </div>
                    <h4>{patent.title}</h4>
                    {patent.filingDate && (
                      <span className="work-date">
                        {new Date(patent.filingDate).toLocaleDateString('uk-UA')}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Документи */}
          {author.documents && author.documents.length > 0 && (
            <div className="works-section">
              <h2><FiFileText /> Публікації ({author.documents.length})</h2>
              <div className="works-list">
                {author.documents.map(doc => (
                  <Link to={`/documents/${doc.id}`} key={doc.id} className="work-card">
                    <div className="work-meta">
                      <span className="work-type">{doc.docType}</span>
                      {doc.publicationYear && (
                        <span className="work-year">{doc.publicationYear}</span>
                      )}
                    </div>
                    <h4>{doc.title}</h4>
                    {doc.journal && (
                      <span className="work-journal">{doc.journal}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorDetail;
