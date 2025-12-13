const express = require('express');
const router = express.Router();

const patentsRouter = require('./patents');
const documentsRouter = require('./documents');
const authorsRouter = require('./authors');
const categoriesRouter = require('./categories');
const searchRouter = require('./search');
const statsRouter = require('./stats');
const extendedRouter = require('./extended');

router.use('/patents', patentsRouter);
router.use('/documents', documentsRouter);
router.use('/authors', authorsRouter);
router.use('/categories', categoriesRouter);
router.use('/search', searchRouter);
router.use('/stats', statsRouter);
router.use('/', extendedRouter);

// Базовий роут
router.get('/', (req, res) => {
  res.json({
    message: 'Інформаційно-пошукова система центру НТІ та патентів',
    version: '1.0.0',
    endpoints: {
      patents: '/api/patents',
      documents: '/api/documents',
      authors: '/api/authors',
      categories: '/api/categories',
      search: '/api/search',
      stats: '/api/stats',
      bookmarks: '/api/bookmarks',
      tags: '/api/tags',
      export: '/api/export'
    }
  });
});

module.exports = router;
