const express = require('express');
const router = express.Router();
const controller = require('../controllers/users.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth.verifyToken, controller.list);
router.get('/:id', auth.verifyToken, controller.getById);
router.put('/:id', auth.verifyToken, controller.updateRole);

module.exports = router;
