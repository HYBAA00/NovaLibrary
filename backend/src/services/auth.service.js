const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signUser(user) {
  const secret = process.env.JWT_SECRET || 'secret';
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

exports.register = async ({ email, password, name, role }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const err = new Error('Email invalide');
    err.status = 400;
    throw err;
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length) {
    const err = new Error('Cet email existe deja');
    err.status = 409;
    throw err;
  }

  const [[countRow]] = await pool.query('SELECT COUNT(*) AS count FROM users');
  const userRole = Number(countRow.count) === 0 ? 'ADMIN' : 'USER';
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    [normalizedEmail, hashed, String(name || '').trim(), userRole]
  );

  return signUser({ id: result.insertId, email: normalizedEmail, name: String(name || '').trim(), role: userRole });
};

exports.login = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
  const user = rows[0];
  if (!user) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }
  return signUser(user);
};
