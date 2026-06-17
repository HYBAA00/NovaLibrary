const pool = require('../config/db');

exports.history = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT lm.id, lm.message, lm.created_at, u.id AS user_id, u.name AS user_name, u.role AS user_role
       FROM live_messages lm
       JOIN users u ON u.id = lm.user_id
       ORDER BY lm.created_at DESC
       LIMIT 80`
    );
    res.json(rows.reverse());
  } catch (e) {
    next(e);
  }
};
