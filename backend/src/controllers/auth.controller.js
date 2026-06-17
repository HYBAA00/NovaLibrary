const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caracteres' });

    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
};
