const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.get('/', authorController.getAll);
router.get('/top', authorController.getTopAuthors);
router.get('/coauthors', authorController.getCoauthors);
router.get('/:id', authorController.getById);
router.post('/', authorController.create);
router.put('/:id', authorController.update);
router.delete('/:id', authorController.delete);

module.exports = router;
