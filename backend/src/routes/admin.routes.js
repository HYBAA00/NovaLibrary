const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth.verifyToken, auth.requireRole('ADMIN'));

router.get('/stats', controller.stats);
router.get('/users-stats', controller.usersStats);
router.get('/books-stats', controller.booksStats);

module.exports = router;
