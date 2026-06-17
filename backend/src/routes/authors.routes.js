const express = require('express');
const router = express.Router();
const controller = require('../controllers/authors.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth.verifyToken, controller.list);
router.post('/', auth.verifyToken, controller.create);
router.put('/:id', auth.verifyToken, controller.update);
router.delete('/:id', auth.verifyToken, controller.remove);

module.exports = router;
