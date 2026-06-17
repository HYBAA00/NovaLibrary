const express = require('express');
const router = express.Router();
const controller = require('../controllers/ai.controller');
const auth = require('../middleware/auth.middleware');

router.post('/recommend', auth.verifyToken, controller.recommend);
router.post('/books/:id/summary', auth.verifyToken, controller.summarizeBook);

module.exports = router;
