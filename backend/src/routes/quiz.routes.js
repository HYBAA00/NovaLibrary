const express = require('express');
const router = express.Router();
const controller = require('../controllers/quiz.controller');
const auth = require('../middleware/auth.middleware');

router.get('/leaderboard', auth.verifyToken, controller.leaderboard);
router.post('/start', auth.verifyToken, controller.start);
router.post('/:sessionId/submit', auth.verifyToken, controller.submit);

module.exports = router;
