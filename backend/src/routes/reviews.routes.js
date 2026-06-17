const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const auth = require('../middleware/auth.middleware');
const reviewsCtrl = require('../controllers/reviews.controller');

router.get('/all', verifyToken, auth.requireRole('ADMIN'), reviewsCtrl.listAll);
router.get('/:bookId', reviewsCtrl.listByBook);
router.post('/', verifyToken, reviewsCtrl.create);
router.delete('/:id', verifyToken, reviewsCtrl.remove);

module.exports = router;
