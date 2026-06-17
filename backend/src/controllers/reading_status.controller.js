const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, rs.status, rs.updated_at,
        COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
        COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name
       FROM reading_status rs
       JOIN books b ON b.id = rs.book_id
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_categories bc ON bc.book_id = b.id
       LEFT JOIN categories c ON c.id = bc.category_id
       WHERE rs.user_id = ?
       GROUP BY b.id, rs.status, rs.updated_at
       ORDER BY rs.updated_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { console.error('reading_status.list', e); next(e); }
};

exports.upsert = async (req, res, next) => {
  try {
    const { book_id, status } = req.body;
    if (!book_id || !status) return res.status(400).json({ message: 'book_id and status required' });
    const allowedStatuses = ['want_to_read', 'reading', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'status must be want_to_read, reading, or completed' });
    }
    await pool.query(
      'INSERT INTO reading_status (user_id, book_id, status, updated_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW()',
      [req.user.id, book_id, status]
    );
    res.json({ ok: true });
  } catch (e) { console.error('reading_status.upsert', e); next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    await pool.query('DELETE FROM reading_status WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
    res.status(204).end();
  } catch (e) { console.error('reading_status.remove', e); next(e); }
};

exports.check = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const [rows] = await pool.query('SELECT status FROM reading_status WHERE user_id = ? AND book_id = ? LIMIT 1', [req.user.id, bookId]);
    res.json({ status: (rows && rows[0] && rows[0].status) || null });
  } catch (e) { console.error('reading_status.check', e); next(e); }
};

module.exports = exports;
