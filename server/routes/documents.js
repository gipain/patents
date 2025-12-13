const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.get('/', documentController.getAll);
router.get('/stats', documentController.getStats);
router.get('/:id', documentController.getById);
router.post('/', documentController.create);
router.put('/:id', documentController.update);
router.delete('/:id', documentController.delete);

module.exports = router;
