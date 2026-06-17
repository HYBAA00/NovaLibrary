const express = require('express');
const router = express.Router();
const controller = require('../controllers/favorites.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth.verifyToken, controller.list);
router.post('/', auth.verifyToken, controller.add);
router.delete('/:bookId', auth.verifyToken, controller.remove);
router.get('/:bookId/check', auth.verifyToken, controller.check);

module.exports = router;
