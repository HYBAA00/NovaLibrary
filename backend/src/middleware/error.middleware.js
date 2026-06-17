module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  const payload = {
    message: status >= 500 ? 'Erreur interne du serveur' : (err.message || 'Requete invalide'),
  };

  if (process.env.NODE_ENV !== 'production' && err.code) {
    payload.code = err.code;
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
};
