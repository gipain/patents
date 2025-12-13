const express = require('express');
const router = express.Router();
const extendedController = require('../controllers/extendedController');

// Закладки
router.get('/bookmarks', extendedController.getBookmarks);
router.post('/bookmarks', extendedController.addBookmark);
router.delete('/bookmarks/:id', extendedController.removeBookmark);

// Нотатки
router.get('/notes', extendedController.getNotes);
router.post('/notes', extendedController.createNote);
router.put('/notes/:id', extendedController.updateNote);
router.delete('/notes/:id', extendedController.deleteNote);

// Теги
router.get('/tags', extendedController.getTags);
router.post('/tags', extendedController.createTag);
router.delete('/tags/:id', extendedController.deleteTag);

// Сповіщення
router.get('/notifications', extendedController.getNotifications);
router.put('/notifications/:id/read', extendedController.markAsRead);
router.put('/notifications/read-all', extendedController.markAllAsRead);

// Експорт
router.get('/export/patents', extendedController.exportPatents);
router.get('/export/documents', extendedController.exportDocuments);

module.exports = router;
