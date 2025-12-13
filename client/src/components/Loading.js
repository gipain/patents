import React from 'react';

const Loading = ({ text = 'Завантаження...' }) => {
  return (
    <div className="loading-container">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{text}</p>
      </div>
    </div>
  );
};

export default Loading;
