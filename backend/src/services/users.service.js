const pool = require('../config/db');

exports.list = async () => { const [rows] = await pool.query('SELECT id, email, name, role, created_at FROM users'); return rows; };
exports.getById = async (id) => { const [rows] = await pool.query('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [id]); return rows[0]; };

exports.updateRole = async (id, role) => {
	await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
};
