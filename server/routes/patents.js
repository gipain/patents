const express = require('express');
const router = express.Router();
const patentController = require('../controllers/patentController');

router.get('/', patentController.getAll);
router.get('/stats', patentController.getStats);
router.get('/:id', patentController.getById);
router.post('/', patentController.create);
router.put('/:id', patentController.update);
router.delete('/:id', patentController.delete);

module.exports = router;
