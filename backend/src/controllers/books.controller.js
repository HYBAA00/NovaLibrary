const pool = require('../config/db');
const { paginate } = require('../utils/paginator');

async function getOrCreateAuthorId(conn, name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  if (!Number.isNaN(Number(clean))) return Number(clean);
  const [rows] = await conn.query('SELECT id FROM authors WHERE name = ? LIMIT 1', [clean]);
  if (rows.length) return rows[0].id;
  const [result] = await conn.query('INSERT INTO authors (name) VALUES (?)', [clean]);
  return result.insertId;
}

async function getOrCreateCategoryId(conn, name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  if (!Number.isNaN(Number(clean))) return Number(clean);
  const [rows] = await conn.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [clean]);
  if (rows.length) return rows[0].id;
  const [result] = await conn.query('INSERT INTO categories (name) VALUES (?)', [clean]);
  return result.insertId;
}

function normalizeListField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value).split(',').map(item => item.trim()).filter(Boolean);
}

function buildFilters(query) {
  const where = [];
  const params = [];

  const q = String(query.search || query.q || '').trim();
  if (q) {
    const like = `%${q}%`;
    where.push('(b.title LIKE ? OR b.description LIKE ? OR a.name LIKE ? OR c.name LIKE ?)');
    params.push(like, like, like, like);
  }

  const category = String(query.category || '').trim();
  if (category) {
    where.push('c.name = ?');
    params.push(category);
  }

  const author = String(query.author || '').trim();
  if (author) {
    where.push('a.name = ?');
    params.push(author);
  }

  return {
    clause: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params,
  };
}

function resolveSort(sort) {
  const sortMap = {
    newest: 'b.created_at DESC',
    published: 'b.published_date DESC, b.created_at DESC',
    title: 'b.title ASC',
    rating: 'average_rating DESC, review_count DESC, b.created_at DESC',
    popular: 'favorites_count DESC, reading_count DESC, b.created_at DESC',
  };
  return sortMap[sort] || sortMap.published;
}

function selectedFiles(files = {}) {
  const pdf = files.pdf && files.pdf[0];
  const cover = files.cover && files.cover[0];
  return {
    fileUrl: pdf ? `/uploads/books/${pdf.filename}` : undefined,
    coverUrl: cover ? `/uploads/covers/${cover.filename}` : undefined,
  };
}

async function replaceRelations(conn, bookId, type, values) {
  if (type === 'authors') {
    await conn.query('DELETE FROM book_authors WHERE book_id = ?', [bookId]);
    for (const value of values) {
      const authorId = await getOrCreateAuthorId(conn, value);
      if (authorId) await conn.query('INSERT IGNORE INTO book_authors (book_id, author_id) VALUES (?, ?)', [bookId, authorId]);
    }
  }

  if (type === 'categories') {
    await conn.query('DELETE FROM book_categories WHERE book_id = ?', [bookId]);
    for (const value of values) {
      const categoryId = await getOrCreateCategoryId(conn, value);
      if (categoryId) await conn.query('INSERT IGNORE INTO book_categories (book_id, category_id) VALUES (?, ?)', [bookId, categoryId]);
    }
  }
}

function bookSelect() {
  return `SELECT b.id, b.title, b.description, b.file_url, b.cover_url, b.published_date, b.created_at,
    COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
    COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name,
    COALESCE(ROUND((SELECT AVG(r.rating) FROM reviews r WHERE r.book_id = b.id), 1), 0) AS average_rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.book_id = b.id) AS review_count,
    (SELECT COUNT(*) FROM favorites f WHERE f.book_id = b.id) AS favorites_count,
    (SELECT COUNT(*) FROM reading_status rs WHERE rs.book_id = b.id AND rs.status = 'reading') AS reading_count
  FROM books b
  LEFT JOIN book_authors ba ON ba.book_id = b.id
  LEFT JOIN authors a ON a.id = ba.author_id
  LEFT JOIN book_categories bc ON bc.book_id = b.id
  LEFT JOIN categories c ON c.id = bc.category_id`;
}

const groupBy = `GROUP BY b.id, b.title, b.description, b.file_url, b.cover_url, b.published_date, b.created_at`;

exports.list = async (req, res, next) => {
  try {
    const { page, pageSize, limit, offset } = paginate(req.query.page, req.query.pageSize);
    const filters = buildFilters(req.query);
    const orderBy = resolveSort(req.query.sort);

    const countSql = `SELECT COUNT(DISTINCT b.id) AS total
      FROM books b
      LEFT JOIN book_authors ba ON ba.book_id = b.id
      LEFT JOIN authors a ON a.id = ba.author_id
      LEFT JOIN book_categories bc ON bc.book_id = b.id
      LEFT JOIN categories c ON c.id = bc.category_id
      ${filters.clause}`;
    const [[countRow]] = await pool.query(countSql, filters.params);

    const sql = `${bookSelect()}
      ${filters.clause}
      ${groupBy}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, [...filters.params, limit, offset]);
    const total = Number(countRow.total || 0);

    res.json({
      data: rows,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const sql = `${bookSelect()}
      WHERE b.id = ?
      ${groupBy}`;
    const [rows] = await pool.query(sql, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Titre requis' });

    await conn.beginTransaction();
    const { fileUrl, coverUrl } = selectedFiles(req.files);
    const publishedDate = req.body.published_date || req.body.published_at || null;

    const [result] = await conn.query(
      'INSERT INTO books (title, description, file_url, cover_url, published_date) VALUES (?, ?, ?, ?, ?)',
      [title, req.body.description || null, fileUrl || null, coverUrl || null, publishedDate]
    );
    const bookId = result.insertId;

    await replaceRelations(conn, bookId, 'authors', normalizeListField(req.body.authors || req.body.author));
    await replaceRelations(conn, bookId, 'categories', normalizeListField(req.body.categories || req.body.category));

    await conn.commit();
    res.status(201).json({ id: bookId });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

exports.update = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const [existingRows] = await conn.query('SELECT * FROM books WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existingRows.length) return res.status(404).json({ message: 'Livre introuvable' });
    const existing = existingRows[0];

    const title = String(req.body.title || existing.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Titre requis' });

    await conn.beginTransaction();
    const { fileUrl, coverUrl } = selectedFiles(req.files);
    const publishedDate = req.body.published_date || req.body.published_at || existing.published_date || null;

    await conn.query(
      'UPDATE books SET title = ?, description = ?, file_url = ?, cover_url = ?, published_date = ? WHERE id = ?',
      [
        title,
        Object.prototype.hasOwnProperty.call(req.body, 'description') ? req.body.description || null : existing.description,
        fileUrl || existing.file_url || null,
        coverUrl || existing.cover_url || null,
        publishedDate,
        req.params.id,
      ]
    );

    if (Object.prototype.hasOwnProperty.call(req.body, 'authors') || Object.prototype.hasOwnProperty.call(req.body, 'author')) {
      await replaceRelations(conn, req.params.id, 'authors', normalizeListField(req.body.authors || req.body.author));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'categories') || Object.prototype.hasOwnProperty.call(req.body, 'category')) {
      await replaceRelations(conn, req.params.id, 'categories', normalizeListField(req.body.categories || req.body.category));
    }

    await conn.commit();
    res.json({ id: Number(req.params.id) });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Livre introuvable' });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
