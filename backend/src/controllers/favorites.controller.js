const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT b.*, f.created_at as favorited_at FROM favorites f JOIN books b ON b.id = f.book_id WHERE f.user_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { console.error('favorites.list', e); next(e); }
};

exports.add = async (req, res, next) => {
  try {
    const { book_id } = req.body;
    if (!book_id) return res.status(400).json({ message: 'book_id required' });
    await pool.query('INSERT IGNORE INTO favorites (user_id, book_id, created_at) VALUES (?, ?, NOW())', [req.user.id, book_id]);
    res.status(201).json({ ok: true });
  } catch (e) { console.error('favorites.add', e); next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    res.status(204).end();
  } catch (e) { console.error('favorites.remove', e); next(e); }
};

exports.check = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const [rows] = await pool.query('SELECT 1 FROM favorites WHERE user_id = ? AND book_id = ? LIMIT 1', [req.user.id, bookId]);
    res.json({ isFavorite: !!(rows && rows.length) });
  } catch (e) { console.error('favorites.check', e); next(e); }
};

module.exports = exports;
