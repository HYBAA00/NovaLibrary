const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT br.id, br.title, br.author, br.note, br.status, br.created_at, br.updated_at,
        u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM book_requests br
       JOIN users u ON u.id = br.user_id
       ORDER BY br.created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const author = String(req.body.author || '').trim();
    const note = String(req.body.note || '').trim();

    if (!title) return res.status(400).json({ message: 'Titre requis' });

    const [result] = await pool.query(
      'INSERT INTO book_requests (user_id, title, author, note, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, author || null, note || null, 'pending']
    );

    res.status(201).json({
      id: result.insertId,
      title,
      author,
      note,
      status: 'pending',
    });
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const status = String(req.body.status || '').trim();
    const allowed = ['pending', 'approved', 'rejected', 'fulfilled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Statut invalide' });

    const [result] = await pool.query(
      'UPDATE book_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: 'Demande introuvable' });
    res.json({ id: Number(req.params.id), status });
  } catch (e) {
    next(e);
  }
};
