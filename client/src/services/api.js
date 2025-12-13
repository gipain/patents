import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Patents API
export const patentsAPI = {
  getAll: (params) => api.get("/patents", { params }),
  getById: (id) => api.get(`/patents/${id}`),
  create: (data) => api.post("/patents", data),
  update: (id, data) => api.put(`/patents/${id}`, data),
  delete: (id) => api.delete(`/patents/${id}`),
  getStats: () => api.get("/patents/stats"),
};

// Documents API
export const documentsAPI = {
  getAll: (params) => api.get("/documents", { params }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post("/documents", data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  getStats: () => api.get("/documents/stats"),
};

// Authors API
export const authorsAPI = {
  getAll: (params) => api.get("/authors", { params }),
  getById: (id) => api.get(`/authors/${id}`),
  create: (data) => api.post("/authors", data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id) => api.delete(`/authors/${id}`),
  getTop: (limit) => api.get("/authors/top", { params: { limit } }),
  getCoauthors: () => api.get("/authors/coauthors"),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getAllFlat: () => api.get("/categories/flat"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Search API
export const searchAPI = {
  search: (params) => api.get("/search", { params }),
  global: (params) => api.get("/search", { params }),
  advanced: (params) => api.get("/search/advanced", { params }),
  getHistory: (limit) => api.get("/search/history", { params: { limit } }),
  getPopular: () => api.get("/search/popular"),
};

// Stats API
export const statsAPI = {
  getOverview: () => api.get("/stats"),
  getDashboard: () => api.get("/stats/dashboard"),
  getTrends: (years) => api.get("/stats/trends", { params: { years } }),
  getCategoryStats: () => api.get("/stats/categories"),
  getOrganizationStats: () => api.get("/stats/organizations"),
  getTopIPCCodes: (limit) => api.get("/stats/ipc", { params: { limit } }),
  getSearchAnalytics: () => api.get("/stats/search"),
};

// Extended API
export const bookmarksAPI = {
  getAll: () => api.get("/bookmarks"),
  add: (data) => api.post("/bookmarks", data),
  remove: (id) => api.delete(`/bookmarks/${id}`),
};

export const tagsAPI = {
  getAll: () => api.get("/tags"),
  create: (data) => api.post("/tags", data),
  delete: (id) => api.delete(`/tags/${id}`),
};

export const notificationsAPI = {
  getAll: (unreadOnly) => api.get("/notifications", { params: { unreadOnly } }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
};

export const exportAPI = {
  patents: (params) =>
    api.get("/export/patents", {
      params,
      responseType: params.format !== "json" ? "blob" : "json",
    }),
  documents: (params) =>
    api.get("/export/documents", {
      params,
      responseType: params.format !== "json" ? "blob" : "json",
    }),
};

export default api;
