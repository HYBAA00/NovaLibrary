const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async ({ email, password, name, role }) => {
  const hashed = await bcrypt.hash(password, 10);
  const userRole = role && (role === 'ADMIN') ? 'ADMIN' : 'USER';
  const [result] = await pool.query('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [email, hashed, name || '', userRole]);
  return { id: result.insertId, email };
};

exports.login = async ({ email, password }) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  return token;
};
