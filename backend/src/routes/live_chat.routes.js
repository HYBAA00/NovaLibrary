const express = require('express');
const router = express.Router();
const controller = require('../controllers/live_chat.controller');
const auth = require('../middleware/auth.middleware');

router.get('/messages', auth.verifyToken, controller.history);

module.exports = router;
