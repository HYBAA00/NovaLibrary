const pool = require('../config/db');

function normalize(text) {
  return String(text || '').trim();
}

function formatBook(book) {
  const author = book.author_name ? ` par ${book.author_name}` : '';
  const category = book.category_name ? ` (${book.category_name})` : '';
  return `- ${book.title}${author}${category}`;
}

exports.sendMessage = async (user, message) => {
  const text = normalize(message);
  const like = `%${text}%`;

  const [matches] = await pool.query(
    `SELECT b.id, b.title,
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
     LIMIT 5`,
    [like, like, like, like]
  );

  let reply;
  if (matches.length) {
    reply = `J'ai trouve ${matches.length} livre(s) qui correspondent a votre demande:\n${matches.map(formatBook).join('\n')}\n\nAstuce: ouvrez le catalogue et utilisez les filtres pour affiner par auteur ou categorie.`;
  } else {
    const [popular] = await pool.query(
      `SELECT b.id, b.title,
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
       LIMIT 3`
    );

    reply = popular.length
      ? `Je n'ai pas trouve de correspondance exacte. Voici des suggestions populaires:\n${popular.map(formatBook).join('\n')}`
      : "Le catalogue est encore vide. Ajoutez des livres depuis l'espace admin, puis je pourrai faire des recommandations.";
  }

  await pool.query(
    'INSERT INTO chat_messages (user_id, message, response) VALUES (?, ?, ?)',
    [user?.id || null, text, reply]
  );

  return reply;
};
