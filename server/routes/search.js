const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/', searchController.globalSearch);
router.get('/advanced', searchController.advancedSearch);
router.get('/history', searchController.getSearchHistory);
router.get('/popular', searchController.getPopularSearches);

module.exports = router;
