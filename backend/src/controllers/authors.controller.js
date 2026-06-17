const pool = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM authors ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    const [r] = await pool.query('INSERT INTO authors (name) VALUES (?)', [name]);
    res.status(201).json({ id: r.insertId, name });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    const [result] = await pool.query('UPDATE authors SET name = ? WHERE id = ?', [name, id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Auteur introuvable' });
    res.json({ id: Number(id), name });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM authors WHERE id = ?', [id]);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
