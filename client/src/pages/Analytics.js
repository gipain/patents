import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAward, FiFileText, FiUsers, FiFolder, FiCalendar, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { statsAPI } from '../services/api';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import './Analytics.css';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overview: {},
    patentsByCategory: [],
    patentsByStatus: [],
    patentsByYear: [],
    documentsByType: [],
    documentsByYear: [],
    topAuthors: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Помилка завантаження статистики');
        // Використовуємо моковані дані для демонстрації
        setStats(getMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getMockData = () => ({
    overview: {
      totalPatents: 182,
      totalDocuments: 308,
      totalAuthors: 62,
      totalCategories: 23,
      patentsThisYear: 28,
      documentsThisYear: 45
    },
    patentsByCategory: [
      { name: 'Інформаційні технології', count: 45 },
      { name: 'Машинобудування', count: 32 },
      { name: 'Хімія', count: 28 },
      { name: 'Електроніка', count: 25 },
      { name: 'Біотехнології', count: 18 },
      { name: 'Інше', count: 34 }
    ],
    patentsByStatus: [
      { status: 'granted', count: 120, label: 'Діючі' },
      { status: 'pending', count: 35, label: 'Очікують' },
      { status: 'expired', count: 20, label: 'Закінчились' },
      { status: 'rejected', count: 7, label: 'Відхилені' }
    ],
    patentsByYear: [
      { year: 2019, count: 22 },
      { year: 2020, count: 28 },
      { year: 2021, count: 35 },
      { year: 2022, count: 42 },
      { year: 2023, count: 38 },
      { year: 2024, count: 17 }
    ],
    documentsByType: [
      { type: 'article', count: 95, label: 'Статті' },
      { type: 'thesis', count: 45, label: 'Дисертації' },
      { type: 'report', count: 68, label: 'Звіти' },
      { type: 'conference', count: 55, label: 'Конференції' },
      { type: 'book', count: 25, label: 'Книги' },
      { type: 'other', count: 20, label: 'Інше' }
    ],
    documentsByYear: [
      { year: 2019, count: 42 },
      { year: 2020, count: 55 },
      { year: 2021, count: 68 },
      { year: 2022, count: 72 },
      { year: 2023, count: 51 },
      { year: 2024, count: 20 }
    ],
    topAuthors: [
      { name: 'Петренко І.В.', patents: 15, documents: 23 },
      { name: 'Коваленко О.М.', patents: 12, documents: 18 },
      { name: 'Сидоренко В.П.', patents: 10, documents: 25 },
      { name: 'Мельник Т.С.', patents: 9, documents: 15 },
      { name: 'Бондаренко Л.К.', patents: 8, documents: 12 }
    ]
  });

  const chartColors = {
    primary: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    status: {
      granted: '#10b981',
      pending: '#f59e0b',
      expired: '#6b7280',
      rejected: '#ef4444'
    }
  };

  // Дані для графіків
  const categoryChartData = {
    labels: stats.patentsByCategory?.map(c => c.name) || [],
    datasets: [{
      data: stats.patentsByCategory?.map(c => c.count) || [],
      backgroundColor: chartColors.primary,
      borderWidth: 0
    }]
  };

  const statusChartData = {
    labels: stats.patentsByStatus?.map(s => s.label) || [],
    datasets: [{
      data: stats.patentsByStatus?.map(s => s.count) || [],
      backgroundColor: stats.patentsByStatus?.map(s => chartColors.status[s.status]) || [],
      borderWidth: 0
    }]
  };

  const yearlyPatentsData = {
    labels: stats.patentsByYear?.map(y => y.year) || [],
    datasets: [{
      label: 'Патенти',
      data: stats.patentsByYear?.map(y => y.count) || [],
      backgroundColor: '#2563eb',
      borderRadius: 6
    }]
  };

  const yearlyComparisonData = {
    labels: stats.patentsByYear?.map(y => y.year) || [],
    datasets: [
      {
        label: 'Патенти',
        data: stats.patentsByYear?.map(y => y.count) || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Документи',
        data: stats.documentsByYear?.map(y => y.count) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const documentTypeData = {
    labels: stats.documentsByType?.map(d => d.label) || [],
    datasets: [{
      data: stats.documentsByType?.map(d => d.count) || [],
      backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'],
      borderWidth: 0
    }]
  };

  const authorsChartData = {
    labels: stats.topAuthors?.map(a => a.name) || [],
    datasets: [
      {
        label: 'Патенти',
        data: stats.topAuthors?.map(a => a.patents) || [],
        backgroundColor: '#2563eb',
        borderRadius: 6
      },
      {
        label: 'Документи',
        data: stats.topAuthors?.map(a => a.documents) || [],
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="analytics-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1><FiTrendingUp /> Аналітика та статистика</h1>
            <p>Огляд діяльності центру науково-технічної інформації</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="overview-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FiAward />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.overview?.totalPatents || 0}</span>
              <span className="stat-label">Патентів</span>
              {stats.overview?.patentsThisYear && (
                <span className="stat-change positive">+{stats.overview.patentsThisYear} цього року</span>
              )}
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.overview?.totalDocuments || 0}</span>
              <span className="stat-label">Документів</span>
              {stats.overview?.documentsThisYear && (
                <span className="stat-change positive">+{stats.overview.documentsThisYear} цього року</span>
              )}
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.overview?.totalAuthors || 0}</span>
              <span className="stat-label">Авторів</span>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <FiFolder />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.overview?.totalCategories || 0}</span>
              <span className="stat-label">Категорій</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Патенти за категоріями */}
          <div className="chart-card">
            <div className="chart-header">
              <h3><FiPieChart /> Патенти за категоріями</h3>
            </div>
            <div className="chart-body">
              <div className="chart-container">
                <Pie data={categoryChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Статус патентів */}
          <div className="chart-card">
            <div className="chart-header">
              <h3><FiPieChart /> Статус патентів</h3>
            </div>
            <div className="chart-body">
              <div className="chart-container">
                <Doughnut data={statusChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Динаміка патентів */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h3><FiBarChart2 /> Патенти за роками</h3>
            </div>
            <div className="chart-body">
              <div className="chart-container tall">
                <Bar data={yearlyPatentsData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Порівняння патенти/документи */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h3><FiTrendingUp /> Динаміка публікацій</h3>
            </div>
            <div className="chart-body">
              <div className="chart-container tall">
                <Line data={yearlyComparisonData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Типи документів */}
          <div className="chart-card">
            <div className="chart-header">
              <h3><FiFileText /> Документи за типами</h3>
            </div>
            <div className="chart-body">
              <div className="chart-container">
                <Doughnut data={documentTypeData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Топ авторів */}
          <div className="chart-card">
            <div className="chart-header">
              <h3><FiUsers /> Топ-5 авторів</h3>
            </div>
            <div className="chart-body">
              <div className="chart-container">
                <Bar 
                  data={authorsChartData} 
                  options={{
                    ...barOptions,
                    indexAxis: 'y',
                    scales: {
                      x: { beginAtZero: true }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Authors Table */}
        <div className="data-table-section">
          <h3><FiUsers /> Найпродуктивніші автори</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Автор</th>
                  <th>Патенти</th>
                  <th>Документи</th>
                  <th>Всього</th>
                </tr>
              </thead>
              <tbody>
                {stats.topAuthors?.map((author, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{author.name}</td>
                    <td>{author.patents}</td>
                    <td>{author.documents}</td>
                    <td><strong>{author.patents + author.documents}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
