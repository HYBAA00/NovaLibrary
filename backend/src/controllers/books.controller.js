const pool = require('../config/db');
const { paginate } = require('../utils/paginator');

async function getOrCreateAuthorId(conn, name) {
  if (!name) return null;
  if (!isNaN(Number(name))) return Number(name);
  const [rows] = await conn.query('SELECT id FROM authors WHERE name = ? LIMIT 1', [name]);
  if (rows.length) return rows[0].id;
  const [r] = await conn.query('INSERT INTO authors (name) VALUES (?)', [name]);
  return r.insertId;
}

async function getOrCreateCategoryId(conn, name) {
  if (!name) return null;
  if (!isNaN(Number(name))) return Number(name);
  const [rows] = await conn.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [name]);
  if (rows.length) return rows[0].id;
  const [r] = await conn.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return r.insertId;
}

function normalizeListField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
}

exports.list = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const { limit, offset } = paginate(page, pageSize);
    const sql = `SELECT b.id, b.title, b.description, b.file_url, b.cover_url, DATE(b.published_date) AS published_date,
      COALESCE(GROUP_CONCAT(DISTINCT a.name SEPARATOR ', '),'') AS author_name,
      COALESCE(GROUP_CONCAT(DISTINCT c.name SEPARATOR ', '),'') AS category_name
      FROM books b
      LEFT JOIN book_authors ba ON ba.book_id = b.id
      LEFT JOIN authors a ON a.id = ba.author_id
      LEFT JOIN book_categories bc ON bc.book_id = b.id
      LEFT JOIN categories c ON c.id = bc.category_id
      GROUP BY b.id
      ORDER BY b.published_date DESC
      LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, [limit, offset]);
    res.json(rows);
  } catch (e) {
    console.error('books.list error:', e);
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const sql = `SELECT b.id, b.title, b.description, b.file_url, b.cover_url, DATE(b.published_date) AS published_date,
      COALESCE(GROUP_CONCAT(DISTINCT a.name SEPARATOR ', '),'') AS author_name,
      COALESCE(GROUP_CONCAT(DISTINCT c.name SEPARATOR ', '),'') AS category_name
      FROM books b
      LEFT JOIN book_authors ba ON ba.book_id = b.id
      LEFT JOIN authors a ON a.id = ba.author_id
      LEFT JOIN book_categories bc ON bc.book_id = b.id
      LEFT JOIN categories c ON c.id = bc.category_id
      WHERE b.id = ?
      GROUP BY b.id`;
    const [rows] = await pool.query(sql, [req.params.id]);
    res.json(rows[0] || null);
  } catch (e) {
    console.error('books.getById error:', e);
    next(e);
  }
};

exports.create = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { title, description, published_date } = req.body;
    const files = req.files || {};
    const pdf = files.pdf && files.pdf[0];
    const cover = files.cover && files.cover[0];
    const file_url = pdf ? `/uploads/books/${pdf.filename}` : null;
    const cover_url = cover ? `/uploads/covers/${cover.filename}` : null;

    const [r] = await conn.query(
      'INSERT INTO books (title, description, file_url, cover_url, published_date) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, file_url, cover_url, published_date || null]
    );
    const bookId = r.insertId;

    const authorList = normalizeListField(req.body.authors || req.body.author);
    for (const a of authorList) {
      const authorId = await getOrCreateAuthorId(conn, a);
      if (authorId) await conn.query('INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)', [bookId, authorId]);
    }

    const categoryList = normalizeListField(req.body.categories || req.body.category);
    for (const c of categoryList) {
      const categoryId = await getOrCreateCategoryId(conn, c);
      if (categoryId) await conn.query('INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)', [bookId, categoryId]);
    }

    await conn.commit();
    conn.release();
    res.status(201).json({ id: bookId });
  } catch (e) {
    await conn.rollback();
    conn.release();
    console.error('books.create error:', e);
    next(e);
  }
};

exports.update = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { title, description, published_date } = req.body;
    const files = req.files || {};
    const pdf = files.pdf && files.pdf[0];
    const cover = files.cover && files.cover[0];
    const file_url = pdf ? `/uploads/books/${pdf.filename}` : req.body.file_url || null;
    const cover_url = cover ? `/uploads/covers/${cover.filename}` : req.body.cover_url || null;

    await conn.query(
      'UPDATE books SET title = ?, description = ?, file_url = ?, cover_url = ?, published_date = ? WHERE id = ?',
      [title, description || null, file_url, cover_url, published_date || null, req.params.id]
    );

    await conn.query('DELETE FROM book_authors WHERE book_id = ?', [req.params.id]);
    await conn.query('DELETE FROM book_categories WHERE book_id = ?', [req.params.id]);

    const authorList = normalizeListField(req.body.authors || req.body.author);
    for (const a of authorList) {
      const authorId = await getOrCreateAuthorId(conn, a);
      if (authorId) await conn.query('INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)', [req.params.id, authorId]);
    }

    const categoryList = normalizeListField(req.body.categories || req.body.category);
    for (const c of categoryList) {
      const categoryId = await getOrCreateCategoryId(conn, c);
      if (categoryId) await conn.query('INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)', [req.params.id, categoryId]);
    }

    await conn.commit();
    conn.release();
    res.json({ id: Number(req.params.id) });
  } catch (e) {
    await conn.rollback();
    conn.release();
    console.error('books.update error:', e);
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM book_authors WHERE book_id = ?', [req.params.id]);
    await conn.query('DELETE FROM book_categories WHERE book_id = ?', [req.params.id]);
    await conn.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    await conn.commit();
    conn.release();
    res.status(204).end();
  } catch (e) {
    await conn.rollback();
    conn.release();
    console.error('books.remove error:', e);
    next(e);
  }
};
