const pool = require('../config/db');

exports.findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

exports.create = async (user) => {
  const [r] = await pool.query('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [user.email, user.password, user.name || '', user.role || 'USER']);
  return { id: r.insertId };
};
