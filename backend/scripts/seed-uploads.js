require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const pool = require('../src/config/db');

const booksDir = path.join(__dirname, '..', 'uploads', 'books');
const coversDir = path.join(__dirname, '..', 'uploads', 'covers');

const categoryRules = [
  ['Artificial Intelligence', ['ai', 'deepfake', 'cybersecurity', 'forensics', 'image-forgery']],
  ['History', ['berlin', '1945', 'wartime', 'germany', 'fascism', 'far-right']],
  ['Finance', ['assetization', 'investing', 'trading', 'business']],
  ['Romance', ['crave', 'forbidden', 'vow', 'only-for-her', 'cheating']],
  ['Science', ['riemann', 'zeta', 'solar', 'eclipses', 'language', 'evolution']],
  ['Psychology', ['psychology', 'hypochondria', 'sex']],
  ['Nature', ['grasslands', 'habitats', 'walking']],
  ['Law', ['law', 'legal', 'clients', 'firms']],
  ['Thriller', ['serial-killer', 'support-network', 'solace']],
];

function titleize(slug) {
  return slug
    .replace(/-s-/g, "'s-")
    .split('-')
    .filter(Boolean)
    .map((word, index) => {
      if (/^\d/.test(word)) return word;
      if (index > 0 && ['and', 'the', 'of', 'in', 'to', 'for', 'by', 'a', 'an'].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bPdf\b/g, 'PDF');
}

function inferAuthor(slug) {
  const byMatch = slug.match(/^(.*)-by-([a-z0-9-]+)$/);
  if (byMatch) return titleize(byMatch[2]);
  return 'Unknown Author';
}

function inferTitle(slug) {
  const byMatch = slug.match(/^(.*)-by-[a-z0-9-]+$/);
  return titleize(byMatch ? byMatch[1] : slug);
}

function inferCategory(slug) {
  const rule = categoryRules.find(([, keywords]) => keywords.some(keyword => slug.includes(keyword)));
  return rule ? rule[0] : 'General';
}

function descriptionFor(title, category) {
  return `${title} imported into NovaLibrary from the local uploads folder. Category: ${category}.`;
}

async function listFiles(dir) {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function getOrCreate(conn, table, name) {
  const [rows] = await conn.query(`SELECT id FROM ${table} WHERE name = ? LIMIT 1`, [name]);
  if (rows.length) return rows[0].id;
  const [result] = await conn.query(`INSERT INTO ${table} (name) VALUES (?)`, [name]);
  return result.insertId;
}

async function seed() {
  const bookFiles = (await listFiles(booksDir)).filter(file => file.toLowerCase().endsWith('.pdf'));
  const coverFiles = (await listFiles(coversDir)).filter(file => /\.(jpe?g|png|webp)$/i.test(file));
  const coverBySlug = new Map(coverFiles.map(file => [path.parse(file).name.toLowerCase(), file]));

  const conn = await pool.getConnection();
  let inserted = 0;
  let updated = 0;

  try {
    await conn.beginTransaction();

    for (const file of bookFiles) {
      const slug = path.parse(file).name.toLowerCase();
      const title = inferTitle(slug);
      const author = inferAuthor(slug);
      const category = inferCategory(slug);
      const fileUrl = `/uploads/books/${file}`;
      const coverFile = coverBySlug.get(slug);
      const coverUrl = coverFile ? `/uploads/covers/${coverFile}` : null;

      const [existing] = await conn.query('SELECT id FROM books WHERE file_url = ? LIMIT 1', [fileUrl]);
      let bookId;

      if (existing.length) {
        bookId = existing[0].id;
        await conn.query(
          'UPDATE books SET title = ?, description = ?, cover_url = ?, published_date = COALESCE(published_date, CURDATE()) WHERE id = ?',
          [title, descriptionFor(title, category), coverUrl, bookId]
        );
        updated += 1;
      } else {
        const [result] = await conn.query(
          'INSERT INTO books (title, description, file_url, cover_url, published_date) VALUES (?, ?, ?, ?, CURDATE())',
          [title, descriptionFor(title, category), fileUrl, coverUrl]
        );
        bookId = result.insertId;
        inserted += 1;
      }

      const authorId = await getOrCreate(conn, 'authors', author);
      const categoryId = await getOrCreate(conn, 'categories', category);

      await conn.query('DELETE FROM book_authors WHERE book_id = ?', [bookId]);
      await conn.query('DELETE FROM book_categories WHERE book_id = ?', [bookId]);
      await conn.query('INSERT IGNORE INTO book_authors (book_id, author_id) VALUES (?, ?)', [bookId, authorId]);
      await conn.query('INSERT IGNORE INTO book_categories (book_id, category_id) VALUES (?, ?)', [bookId, categoryId]);
    }

    await conn.commit();
    console.log(`Imported ${inserted} books, updated ${updated} books from uploads.`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
