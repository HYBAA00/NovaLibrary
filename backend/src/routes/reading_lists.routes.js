const express = require('express');
const router = express.Router();
const controller = require('../controllers/reading_lists.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth.verifyToken, controller.list);
router.post('/', auth.verifyToken, controller.create);
router.delete('/:id', auth.verifyToken, controller.remove);
router.post('/:id/books', auth.verifyToken, controller.addBook);
router.delete('/:id/books/:bookId', auth.verifyToken, controller.removeBook);
router.get('/:id/books', auth.verifyToken, controller.getBooks);

module.exports = router;
