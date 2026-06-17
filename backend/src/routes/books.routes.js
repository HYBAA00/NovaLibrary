const express = require('express');
const router = express.Router();
const controller = require('../controllers/books.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../config/upload');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', auth.verifyToken, auth.requireRole('ADMIN'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), controller.create);
router.put('/:id', auth.verifyToken, auth.requireRole('ADMIN'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), controller.update);
router.delete('/:id', auth.verifyToken, auth.requireRole('ADMIN'), controller.remove);

module.exports = router;
