const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatbot.controller');
const auth = require('../middleware/auth.middleware');

router.post('/message', auth.verifyToken, controller.sendMessage);

module.exports = router;
