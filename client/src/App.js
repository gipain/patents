import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Layout components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Pages
import Home from "./pages/Home";
import Patents from "./pages/Patents";
import PatentDetail from "./pages/PatentDetail";
import PatentForm from "./pages/PatentForm";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import DocumentForm from "./pages/DocumentForm";
import Authors from "./pages/Authors";
import AuthorDetail from "./pages/AuthorDetail";
import AuthorForm from "./pages/AuthorForm";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import CategoryForm from "./pages/CategoryForm";
import Search from "./pages/Search";
import Analytics from "./pages/Analytics";
import Bookmarks from "./pages/Bookmarks";

// Styles
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Patents */}
          <Route path="/patents" element={<Patents />} />
          <Route path="/patents/new" element={<PatentForm />} />
          <Route path="/patents/:id" element={<PatentDetail />} />
          <Route path="/patents/:id/edit" element={<PatentForm />} />

          {/* Documents */}
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/new" element={<DocumentForm />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/documents/:id/edit" element={<DocumentForm />} />

          {/* Authors */}
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/new" element={<AuthorForm />} />
          <Route path="/authors/:id" element={<AuthorDetail />} />
          <Route path="/authors/:id/edit" element={<AuthorForm />} />

          {/* Categories */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/categories/:id/edit" element={<CategoryForm />} />

          {/* Search */}
          <Route path="/search" element={<Search />} />
          <Route path="/search/advanced" element={<Search />} />

          {/* Bookmarks */}
          <Route path="/bookmarks" element={<Bookmarks />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

      {/* ToastContainer is declared in index.js to avoid duplicates */}
    </div>
  );
}

// 404 Page
const NotFound = () => (
  <div className="not-found">
    <div className="container">
      <h1>404</h1>
      <h2>Сторінку не знайдено</h2>
      <p>Сторінка, яку ви шукаєте, не існує або була переміщена.</p>
      <Link to="/" className="btn btn-primary">
        На головну
      </Link>
    </div>
  </div>
);

export default App;
