const pool = require('../config/db');
const mistral = require('./mistral.service');

function sanitizeQuestion(question, index) {
  const options = Array.isArray(question.options) ? question.options.slice(0, 4).map(String) : [];
  while (options.length < 4) options.push(`Option ${options.length + 1}`);
  const correctIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : Number(question.correctIndex || 0);
  return {
    id: index + 1,
    question: String(question.question || `Question ${index + 1}`),
    options,
    correctIndex: Math.min(Math.max(correctIndex, 0), 3),
    explanation: String(question.explanation || ''),
  };
}

function hideAnswers(question) {
  const { correctIndex, explanation, ...publicQuestion } = question;
  return publicQuestion;
}

async function catalogueContext(topic) {
  const like = `%${topic || ''}%`;
  const [rows] = await pool.query(
    `SELECT b.title, LEFT(COALESCE(b.description, ''), 500) AS description,
      COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '), '') AS author_name,
      COALESCE(GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', '), '') AS category_name
     FROM books b
     LEFT JOIN book_authors ba ON ba.book_id = b.id
     LEFT JOIN authors a ON a.id = ba.author_id
     LEFT JOIN book_categories bc ON bc.book_id = b.id
     LEFT JOIN categories c ON c.id = bc.category_id
     WHERE ? = '' OR b.title LIKE ? OR b.description LIKE ? OR a.name LIKE ? OR c.name LIKE ?
     GROUP BY b.id
     ORDER BY RAND()
     LIMIT 12`,
    [topic || '', like, like, like, like]
  );
  return rows;
}

exports.startQuiz = async (userId, { topic = '', difficulty = 'medium', count = 5 }) => {
  const safeCount = Math.min(Math.max(Number(count) || 5, 3), 10);
  const context = await catalogueContext(String(topic || '').trim());
  const prompt = `Genere un QCM en francais pour une application de bibliotheque.
Retourne uniquement du JSON valide au format:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
Nombre de questions: ${safeCount}
Difficulte: ${difficulty}
Sujet: ${topic || 'culture generale litteraire et catalogue fourni'}
Catalogue:
${context.map(item => `Titre: ${item.title}; Auteur: ${item.author_name}; Categorie: ${item.category_name}; Description: ${item.description}`).join('\n') || 'Catalogue vide: utilise culture generale litteraire.'}`;

  const raw = await mistral.chat([
    { role: 'system', content: 'Tu es un createur de QCM precis. Tu reponds uniquement en JSON valide, sans markdown.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.35, maxTokens: 1400, responseFormat: { type: 'json_object' } });

  const parsed = mistral.extractJson(raw);
  const questions = (parsed.questions || parsed || []).slice(0, safeCount).map(sanitizeQuestion);
  if (!questions.length) {
    const err = new Error('Impossible de generer le QCM');
    err.status = 502;
    throw err;
  }

  const [result] = await pool.query(
    'INSERT INTO quiz_sessions (user_id, topic, difficulty, questions) VALUES (?, ?, ?, ?)',
    [userId, topic || null, difficulty, JSON.stringify(questions)]
  );

  return {
    sessionId: result.insertId,
    questions: questions.map(hideAnswers),
  };
};

exports.submitQuiz = async (userId, sessionId, answers = []) => {
  const [rows] = await pool.query('SELECT * FROM quiz_sessions WHERE id = ? AND user_id = ? LIMIT 1', [sessionId, userId]);
  if (!rows.length) {
    const err = new Error('Session QCM introuvable');
    err.status = 404;
    throw err;
  }

  const session = rows[0];
  if (session.submitted_at) {
    const err = new Error('Ce QCM a deja ete soumis');
    err.status = 409;
    throw err;
  }

  const questions = typeof session.questions === 'string' ? JSON.parse(session.questions) : session.questions;
  let correct = 0;
  const details = questions.map((question, index) => {
    const selectedIndex = Number(answers[index]);
    const isCorrect = selectedIndex === question.correctIndex;
    if (isCorrect) correct += 1;
    return {
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const points = correct * 100 + Math.max(0, questions.length - correct) * 15;
  const score = Math.round((correct / questions.length) * 100);

  await pool.query(
    'UPDATE quiz_sessions SET answers = ?, score = ?, points = ?, submitted_at = NOW() WHERE id = ?',
    [JSON.stringify(answers), score, points, sessionId]
  );
  await pool.query(
    'INSERT INTO quiz_scores (user_id, session_id, score, points) VALUES (?, ?, ?, ?)',
    [userId, sessionId, score, points]
  );

  return { score, points, correct, total: questions.length, details };
};

exports.leaderboard = async () => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, COUNT(qs.id) AS attempts, SUM(qs.points) AS points, MAX(qs.score) AS best_score
     FROM quiz_scores qs
     JOIN users u ON u.id = qs.user_id
     GROUP BY u.id
     ORDER BY points DESC, best_score DESC
     LIMIT 20`
  );
  return rows;
};
