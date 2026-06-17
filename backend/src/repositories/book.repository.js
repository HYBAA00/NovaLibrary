const pool = require('../config/db');

exports.findById = async (id) => { const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]); return rows[0]; };
exports.search = async (q, limit = 10, offset = 0) => { const [rows] = await pool.query('SELECT * FROM books WHERE MATCH(title,description) AGAINST(?) LIMIT ? OFFSET ?', [q, limit, offset]); return rows; };
