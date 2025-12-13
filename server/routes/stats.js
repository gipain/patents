const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/', statsController.getOverview);
router.get('/dashboard', statsController.getDashboardStats);
router.get('/trends', statsController.getTrends);
router.get('/categories', statsController.getCategoryStats);
router.get('/organizations', statsController.getOrganizationStats);
router.get('/ipc', statsController.getTopIPCCodes);
router.get('/search', statsController.getSearchAnalytics);

module.exports = router;
