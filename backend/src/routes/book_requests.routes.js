const express = require('express');
const router = express.Router();
const controller = require('../controllers/book_requests.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth.verifyToken, controller.create);
router.get('/', auth.verifyToken, auth.requireRole('ADMIN'), controller.list);
router.patch('/:id/status', auth.verifyToken, auth.requireRole('ADMIN'), controller.updateStatus);

module.exports = router;
