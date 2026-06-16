const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    // validate basic fields
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    // normalize role
    let userRole = 'USER';
    if (typeof role !== 'undefined' && role !== null && role !== '') {
      const r = String(role).toUpperCase();
      if (r !== 'USER' && r !== 'ADMIN') return res.status(400).json({ message: 'Invalid role. Allowed values: USER, ADMIN' });
      userRole = r;
    }

    const result = await authService.register({ name, email, password, role: userRole });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body);
    res.json({ token });
  } catch (err) { next(err); }
};
