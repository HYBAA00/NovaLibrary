const quizService = require('../services/quiz.service');

exports.start = async (req, res, next) => {
  try {
    const quiz = await quizService.startQuiz(req.user.id, req.body || {});
    res.status(201).json(quiz);
  } catch (e) {
    next(e);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const result = await quizService.submitQuiz(req.user.id, req.params.sessionId, req.body.answers || []);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

exports.leaderboard = async (req, res, next) => {
  try {
    const rows = await quizService.leaderboard();
    res.json(rows);
  } catch (e) {
    next(e);
  }
};
