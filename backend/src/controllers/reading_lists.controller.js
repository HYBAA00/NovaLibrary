const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rl.*, COUNT(rlb.book_id) AS book_count
       FROM reading_lists rl
       LEFT JOIN reading_list_books rlb ON rlb.list_id = rl.id
       WHERE rl.user_id = ?
       GROUP BY rl.id
       ORDER BY rl.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { console.error('reading_lists.list', e); next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'name required' });
    const [[countRow]] = await pool.query('SELECT COUNT(*) as cnt FROM reading_lists WHERE user_id = ?', [req.user.id]);
    const isDefault = (countRow.cnt === 0) ? 1 : 0;
    const [r] = await pool.query('INSERT INTO reading_lists (user_id, name, is_default, created_at) VALUES (?, ?, ?, NOW())', [req.user.id, name, isDefault]);
    res.status(201).json({ id: r.insertId, name, is_default: !!isDefault });
  } catch (e) { console.error('reading_lists.create', e); next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [owner] = await pool.query('SELECT id FROM reading_lists WHERE id = ? AND user_id = ? LIMIT 1', [id, req.user.id]);
    if (!owner.length) return res.status(404).json({ message: 'List not found' });
    await pool.query('DELETE FROM reading_lists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.status(204).end();
  } catch (e) { console.error('reading_lists.remove', e); next(e); }
};

exports.addBook = async (req, res, next) => {
  try {
    const listId = req.params.id;
    const { book_id } = req.body;
    if (!book_id) return res.status(400).json({ message: 'book_id required' });
    const [owner] = await pool.query('SELECT id FROM reading_lists WHERE id = ? AND user_id = ? LIMIT 1', [listId, req.user.id]);
    if (!owner.length) return res.status(404).json({ message: 'List not found' });
    await pool.query('INSERT IGNORE INTO reading_list_books (list_id, book_id, added_at) VALUES (?, ?, NOW())', [listId, book_id]);
    res.status(201).json({ ok: true });
  } catch (e) { console.error('reading_lists.addBook', e); next(e); }
};

exports.removeBook = async (req, res, next) => {
  try {
    const listId = req.params.id;
    const bookId = req.params.bookId;
    const [owner] = await pool.query('SELECT id FROM reading_lists WHERE id = ? AND user_id = ? LIMIT 1', [listId, req.user.id]);
    if (!owner.length) return res.status(404).json({ message: 'List not found' });
    await pool.query('DELETE FROM reading_list_books WHERE list_id = ? AND book_id = ?', [listId, bookId]);
    res.status(204).end();
  } catch (e) { console.error('reading_lists.removeBook', e); next(e); }
};

exports.getBooks = async (req, res, next) => {
  try {
    const listId = req.params.id;
    // Ensure list belongs to user
    const [owner] = await pool.query('SELECT id FROM reading_lists WHERE id = ? AND user_id = ? LIMIT 1', [listId, req.user.id]);
    if (!owner || owner.length === 0) return res.status(404).json({ message: 'List not found' });
    const [rows] = await pool.query(
      `SELECT b.*, rlb.added_at,
        COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
        COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name
       FROM reading_list_books rlb
       JOIN books b ON b.id = rlb.book_id
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_categories bc ON bc.book_id = b.id
       LEFT JOIN categories c ON c.id = bc.category_id
       WHERE rlb.list_id = ?
       GROUP BY b.id, rlb.added_at
       ORDER BY rlb.added_at DESC`,
      [listId]
    );
    res.json(rows);
  } catch (e) { console.error('reading_lists.getBooks', e); next(e); }
};

module.exports = exports;
