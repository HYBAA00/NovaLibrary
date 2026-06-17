const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authentification requise' });
  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : null;
  if (!token) return res.status(401).json({ message: 'Format du token invalide' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (err) { return res.status(401).json({ message: 'Session invalide ou expiree' }); }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentification requise' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acces refuse' });
  }
  next();
};
