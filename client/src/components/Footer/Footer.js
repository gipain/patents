import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>📚 Центр НТІ та патентів</h4>
            <p>
              Інформаційно-пошукова система для управління 
              науково-технічною інформацією та патентами.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Навігація</h4>
            <ul>
              <li><Link to="/patents">Патенти</Link></li>
              <li><Link to="/documents">Документи</Link></li>
              <li><Link to="/authors">Автори</Link></li>
              <li><Link to="/search">Пошук</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Інструменти</h4>
            <ul>
              <li><Link to="/analytics">Аналітика</Link></li>
              <li><Link to="/bookmarks">Закладки</Link></li>
              <li><Link to="/search/advanced">Розширений пошук</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Контакти</h4>
            <ul className="footer-contacts">
              <li>📧 info@nti-center.ua</li>
              <li>📞 +380 (44) 123-45-67</li>
              <li>📍 м. Київ, вул. Наукова, 1</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Центр науково-технічної інформації та патентів. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
