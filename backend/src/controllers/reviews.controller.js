const pool = require('../config/db');

exports.listByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.id AS user_id
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [bookId]
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.listAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, b.title AS book_title
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN books b ON b.id = r.book_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { book_id, rating, comment } = req.body;
    const userId = req.user.id;
    if (!book_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'book_id et rating (1-5) requis' });
    }
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND book_id = ?',
      [userId, book_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour ce livre' });
    }
    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, book_id, rating, comment || '']
    );
    res.status(201).json({ id: result.insertId, user_id: userId, book_id, rating, comment });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const [rows] = await pool.query(
      'SELECT user_id FROM reviews WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Review introuvable' });
    }
    if (String(rows[0].user_id) !== String(userId) && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.status(204).end();
  } catch (e) { next(e); }
};
