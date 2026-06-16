const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try { const [rows] = await pool.query('SELECT id, name FROM categories'); res.json(rows); } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { const { name } = req.body; if (!name) return res.status(400).json({ message: 'Name required' }); const [r] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]); res.status(201).json({ id: r.insertId, name }); } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try { const { id } = req.params; const { name } = req.body; if (!name) return res.status(400).json({ message: 'Name required' }); await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]); res.json({ message: 'Updated' }); } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try { const { id } = req.params; await pool.query('DELETE FROM categories WHERE id = ?', [id]); res.status(204).end(); } catch (e) { next(e); }
};
