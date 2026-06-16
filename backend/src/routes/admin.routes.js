const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');

router.get('/stats', auth.verifyToken, controller.stats);
router.get('/users-stats', auth.verifyToken, controller.usersStats);
router.get('/books-stats', auth.verifyToken, controller.booksStats);

module.exports = router;
