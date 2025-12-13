import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiHome,
  FiFileText,
  FiBook,
  FiUsers,
  FiFolder,
  FiBarChart2,
  FiBookmark,
  FiDownload,
  FiSettings,
} from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const navLinks = [
    { to: "/", icon: <FiHome />, label: "Головна" },
    { to: "/patents", icon: <FiFileText />, label: "Патенти" },
    { to: "/documents", icon: <FiBook />, label: "Документи" },
    { to: "/authors", icon: <FiUsers />, label: "Автори" },
    { to: "/categories", icon: <FiFolder />, label: "Категорії" },
    { to: "/analytics", icon: <FiBarChart2 />, label: "Аналітика" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">📚</span>
          <span className="navbar-title">Центр НТІ та патентів</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <ul className="navbar-nav">
            {navLinks.map((link) => (
              <li key={link.to} className="nav-item">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
            <li className="nav-item dropdown">
              <span className="nav-link dropdown-toggle">
                <FiSettings />
                <span>Інструменти</span>
              </span>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/bookmarks" onClick={() => setIsOpen(false)}>
                    <FiBookmark /> Закладки
                  </Link>
                </li>
                <li>
                  <Link to="/search/advanced" onClick={() => setIsOpen(false)}>
                    <FiSearch /> Розширений пошук
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Пошук..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FiSearch />
          </button>
        </form>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
