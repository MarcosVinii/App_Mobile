const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token não informado.', 401));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = Number(payload.sub);
    return next();
  } catch (error) {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
}

module.exports = authMiddleware;