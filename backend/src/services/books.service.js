const pool = require('../config/db');
const { paginate } = require('../utils/paginator');

exports.list = async (query) => {
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const { limit, offset } = paginate(page, pageSize);
  const sql = `SELECT b.id, b.title, b.description, b.file_url, b.cover_url, b.published_date, b.created_at,
    a.name AS author_name, c.name AS category_name
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN categories c ON b.category_id = c.id
    ORDER BY b.published_date DESC
    LIMIT ? OFFSET ?`;
  const [rows] = await pool.query(sql, [limit, offset]);
  return rows;
};
exports.getById = async (id) => {
  const sql = `SELECT b.id, b.title, b.description, b.file_url, b.cover_url, b.published_date, b.created_at,
    a.name AS author_name, c.name AS category_name
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

async function getOrCreateAuthorId(name) {
  if (!name) return null;
  // if numeric id passed
  if (!isNaN(Number(name))) return Number(name);
  const [rows] = await pool.query('SELECT id FROM authors WHERE name = ? LIMIT 1', [name]);
  if (rows.length) return rows[0].id;
  const [r] = await pool.query('INSERT INTO authors (name) VALUES (?)', [name]);
  return r.insertId;
}

async function getOrCreateCategoryId(name) {
  if (!name) return null;
  if (!isNaN(Number(name))) return Number(name);
  const [rows] = await pool.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [name]);
  if (rows.length) return rows[0].id;
  const [r] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return r.insertId;
}

exports.create = async (data) => {
  const author_id = await getOrCreateAuthorId(data.author || data.author_id || null);
  const category_id = await getOrCreateCategoryId(data.category || data.category_id || null);
  const [r] = await pool.query(
    'INSERT INTO books (title, description, file_url, cover_url, published_date, author_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.title, data.description || null, data.file_url || null, data.cover_url || null, data.published_date || null, author_id, category_id]
  );
  return { id: r.insertId };
};

exports.update = async (id, data) => {
  const author_id = await getOrCreateAuthorId(data.author || data.author_id || null);
  const category_id = await getOrCreateCategoryId(data.category || data.category_id || null);
  await pool.query(
    'UPDATE books SET title = ?, description = ?, file_url = ?, cover_url = ?, published_date = ?, author_id = ?, category_id = ? WHERE id = ?',
    [data.title, data.description || null, data.file_url || null, data.cover_url || null, data.published_date || null, author_id, category_id, id]
  );
  return { id };
};

exports.remove = async (id) => { await pool.query('DELETE FROM books WHERE id = ?', [id]); };
