const pool = require('../config/db');
const mistral = require('../services/mistral.service');

exports.summarizeBook = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.title, b.description,
        COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
        COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name
       FROM books b
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_categories bc ON bc.book_id = b.id
       LEFT JOIN categories c ON c.id = bc.category_id
       WHERE b.id = ?
       GROUP BY b.id
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Livre introuvable' });
    const book = rows[0];
    const summary = await mistral.chat([
      {
        role: 'system',
        content: 'Tu es un bibliothecaire senior. Reponds en francais, avec un resume elegant, points cles et public conseille.',
      },
      {
        role: 'user',
        content: `Livre: ${book.title}
Auteur(s): ${book.author_name || 'Inconnu'}
Categorie(s): ${book.category_name || 'Non definie'}
Description: ${book.description || 'Aucune description'}

Structure la reponse en:
1. Resume court
2. Pourquoi le lire
3. Pour quel lecteur`,
      },
    ], { temperature: 0.35, maxTokens: 700 });

    res.json({ summary });
  } catch (e) {
    next(e);
  }
};

exports.recommend = async (req, res, next) => {
  try {
    const preference = String(req.body.preference || '').trim();
    const [rows] = await pool.query(
      `SELECT b.id, b.title, LEFT(COALESCE(b.description, ''), 500) AS description,
        COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
        COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name
       FROM books b
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_categories bc ON bc.book_id = b.id
       LEFT JOIN categories c ON c.id = bc.category_id
       GROUP BY b.id
       ORDER BY b.created_at DESC
       LIMIT 15`
    );

    const recommendation = await mistral.chat([
      { role: 'system', content: 'Tu es un conseiller de lecture. Choisis uniquement parmi le catalogue fourni.' },
      {
        role: 'user',
        content: `Preference: ${preference || 'lectures interessantes'}
Catalogue:
${rows.map(book => `${book.id}. ${book.title} | ${book.author_name} | ${book.category_name} | ${book.description}`).join('\n')}`,
      },
    ], { temperature: 0.5, maxTokens: 700 });

    res.json({ recommendation });
  } catch (e) {
    next(e);
  }
};
