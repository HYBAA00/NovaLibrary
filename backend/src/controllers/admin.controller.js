const pool = require('../config/db');

exports.stats = async (req, res, next) => {
  try {
    const [[booksCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM books');
    const [[usersCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const [[catsCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM categories');
    const [[authorsCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM authors');
    res.json({ books: booksCnt.cnt, users: usersCnt.cnt, categories: catsCnt.cnt, authors: authorsCnt.cnt });
  } catch (e) { next(e); }
};

exports.usersStats = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    const out = [];
    for (const u of users){
      const [[readingCount]] = await pool.query('SELECT COUNT(*) as cnt FROM reading_status WHERE user_id = ?', [u.id]);
      const [[favCount]] = await pool.query('SELECT COUNT(*) as cnt FROM favorites WHERE user_id = ?', [u.id]);
      const [[topCat]] = await pool.query(
        `SELECT c.name, COUNT(*) as cnt FROM reading_status rs JOIN books b ON b.id=rs.book_id JOIN book_categories bc ON bc.book_id=b.id JOIN categories c ON c.id=bc.category_id WHERE rs.user_id=? GROUP BY c.name ORDER BY cnt DESC LIMIT 1`,
        [u.id]
      );
      const [[topAuthor]] = await pool.query(
        `SELECT a.name, COUNT(*) as cnt FROM reading_status rs JOIN books b ON b.id=rs.book_id JOIN book_authors ba ON ba.book_id=b.id JOIN authors a ON a.id=ba.author_id WHERE rs.user_id=? GROUP BY a.name ORDER BY cnt DESC LIMIT 1`,
        [u.id]
      );
      out.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
        reading_count: readingCount.cnt || 0,
        favorites_count: favCount.cnt || 0,
        top_category: topCat ? topCat.name : null,
        top_author: topAuthor ? topAuthor.name : null,
      })
    }
    res.json(out);
  } catch (e){ next(e); }
};

exports.booksStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.title,
        (SELECT COUNT(*) FROM reading_status rs WHERE rs.book_id = b.id AND rs.status = 'reading') as reading_count,
        (SELECT COUNT(*) FROM favorites f WHERE f.book_id = b.id) as favorites_count
       FROM books b`);
    res.json(rows);
  } catch (e){ next(e); }
};
