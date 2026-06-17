const express = require('express');
const router = express.Router();
const controller = require('../controllers/categories.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', controller.list);
router.post('/', auth.verifyToken, auth.requireRole('ADMIN'), controller.create);
router.put('/:id', auth.verifyToken, auth.requireRole('ADMIN'), controller.update);
router.delete('/:id', auth.verifyToken, auth.requireRole('ADMIN'), controller.remove);

module.exports = router;
