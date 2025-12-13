import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiBook, FiUsers, FiFolder, FiSearch, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { statsAPI, patentsAPI, documentsAPI } from '../services/api';
import Loading from '../components/Loading';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [recentPatents, setRecentPatents] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, patentsRes, documentsRes] = await Promise.all([
          statsAPI.getOverview(),
          patentsAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
          documentsAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' })
        ]);
        
        setStats(statsRes.data);
        setRecentPatents(patentsRes.data.patents);
        setRecentDocuments(documentsRes.data.documents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Інформаційно-пошукова система</h1>
          <h2>Центру науково-технічної інформації та патентів</h2>
          <p>
            Пошук та аналіз патентів, наукових документів та публікацій.
            Доступ до бази даних українських та міжнародних винаходів.
          </p>
          
          <form className="hero-search" onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
            }
          }}>
            <input
              type="text"
              placeholder="Введіть ключові слова, номер патенту або автора..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <FiSearch /> Пошук
            </button>
          </form>
          
          <div className="hero-links">
            <Link to="/patents" className="hero-link">
              <FiFileText /> Переглянути патенти
            </Link>
            <Link to="/documents" className="hero-link">
              <FiBook /> Наукові документи
            </Link>
            <Link to="/search/advanced" className="hero-link">
              <FiSearch /> Розширений пошук
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📜</div>
              <div className="stat-value">{stats?.totals?.patents || 0}</div>
              <div className="stat-label">Патентів</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-value">{stats?.totals?.documents || 0}</div>
              <div className="stat-label">Документів</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍🔬</div>
              <div className="stat-value">{stats?.totals?.authors || 0}</div>
              <div className="stat-label">Авторів</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-value">{stats?.totals?.categories || 0}</div>
              <div className="stat-label">Категорій</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Patents */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2><FiFileText /> Останні патенти</h2>
            <Link to="/patents" className="section-link">
              Всі патенти <FiArrowRight />
            </Link>
          </div>
          
          <div className="cards-grid">
            {recentPatents.map((patent) => (
              <div key={patent.id} className="patent-card card">
                <div className="card-body">
                  <div className="patent-number">{patent.number}</div>
                  <h3 className="patent-title">
                    <Link to={`/patents/${patent.id}`}>{patent.title}</Link>
                  </h3>
                  <p className="patent-abstract">
                    {patent.abstract?.substring(0, 150)}...
                  </p>
                  <div className="patent-meta">
                    {patent.category && (
                      <span className="badge badge-primary">{patent.category.name}</span>
                    )}
                    <span className={`badge badge-${patent.status === 'granted' ? 'success' : 'warning'}`}>
                      {patent.status === 'granted' ? 'Діючий' : patent.status === 'pending' ? 'Очікує' : patent.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Documents */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2><FiBook /> Останні документи</h2>
            <Link to="/documents" className="section-link">
              Всі документи <FiArrowRight />
            </Link>
          </div>
          
          <div className="cards-grid">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="document-card card">
                <div className="card-body">
                  <div className="document-type">{doc.documentType}</div>
                  <h3 className="document-title">
                    <Link to={`/documents/${doc.id}`}>{doc.title}</Link>
                  </h3>
                  <p className="document-abstract">
                    {doc.abstract?.substring(0, 150)}...
                  </p>
                  <div className="document-meta">
                    {doc.journal && <span className="text-muted">{doc.journal}</span>}
                    {doc.publicationDate && (
                      <span className="text-muted">
                        {new Date(doc.publicationDate).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">Можливості системи</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FiSearch /></div>
              <h3>Розширений пошук</h3>
              <p>Пошук за ключовими словами, IPC-кодами, авторами, датами та іншими параметрами</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FiTrendingUp /></div>
              <h3>Аналітика та тренди</h3>
              <p>Візуалізація даних, статистика по категоріях та авторах, аналіз трендів</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FiUsers /></div>
              <h3>Мережа авторів</h3>
              <p>Інтерактивний граф співавторства та зв'язків між науковцями</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FiFolder /></div>
              <h3>Категоризація</h3>
              <p>Систематизація за категоріями, IPC-класами та тематичними напрямками</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
