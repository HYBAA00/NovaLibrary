const pool = require('../config/db');
const mistral = require('./mistral.service');

function normalize(text) {
  return String(text || '').trim();
}

function formatBook(book) {
  const author = book.author_name ? ` par ${book.author_name}` : '';
  const category = book.category_name ? ` (${book.category_name})` : '';
  return `- ${book.title}${author}${category}`;
}

async function findCatalogueMatches(text) {
  const like = `%${text}%`;
  const [matches] = await pool.query(
    `SELECT b.id, b.title, LEFT(COALESCE(b.description, ''), 600) AS description,
      COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
      COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
     FROM books b
     LEFT JOIN book_authors ba ON ba.book_id = b.id
     LEFT JOIN authors a ON a.id = ba.author_id
     LEFT JOIN book_categories bc ON bc.book_id = b.id
     LEFT JOIN categories c ON c.id = bc.category_id
     LEFT JOIN reviews r ON r.book_id = b.id
     WHERE b.title LIKE ? OR b.description LIKE ? OR a.name LIKE ? OR c.name LIKE ?
     GROUP BY b.id
     ORDER BY average_rating DESC, b.created_at DESC
     LIMIT 8`,
    [like, like, like, like]
  );
  return matches;
}

async function popularBooks() {
  const [rows] = await pool.query(
    `SELECT b.id, b.title, LEFT(COALESCE(b.description, ''), 400) AS description,
      COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
      COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
     FROM books b
     LEFT JOIN book_authors ba ON ba.book_id = b.id
     LEFT JOIN authors a ON a.id = ba.author_id
     LEFT JOIN book_categories bc ON bc.book_id = b.id
     LEFT JOIN categories c ON c.id = bc.category_id
     LEFT JOIN reviews r ON r.book_id = b.id
     GROUP BY b.id
     ORDER BY average_rating DESC, b.created_at DESC
     LIMIT 6`
  );
  return rows;
}

exports.sendMessage = async (user, message) => {
  const text = normalize(message);
  const matches = await findCatalogueMatches(text);
  const contextBooks = matches.length ? matches : await popularBooks();

  let reply;
  try {
    reply = await mistral.chat([
      {
        role: 'system',
        content: `Tu es Nova AI, bibliothecaire expert et coach de lecture. Reponds en francais clair, chaleureux et actionnable.
Utilise uniquement les livres fournis comme contexte quand tu cites des titres. Si le catalogue ne suffit pas, dis-le et propose une recherche.`,
      },
      {
        role: 'user',
        content: `Question utilisateur: ${text}

Contexte catalogue:
${contextBooks.map(book => `${formatBook(book)} | note ${book.average_rating || 0}/5 | ${book.description || 'Sans description'}`).join('\n') || 'Catalogue vide'}`,
      },
    ], { temperature: 0.45, maxTokens: 700 });
  } catch (error) {
    reply = contextBooks.length
      ? `Je n'ai pas pu joindre Mistral pour le moment. Voici quand meme des suggestions du catalogue:\n${contextBooks.slice(0, 5).map(formatBook).join('\n')}`
      : "Je n'ai pas pu joindre Mistral et le catalogue est vide pour le moment.";
  }

  await pool.query(
    'INSERT INTO chat_messages (user_id, message, response) VALUES (?, ?, ?)',
    [user?.id || null, text, reply]
  );

  return reply;
};
