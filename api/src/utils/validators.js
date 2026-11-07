const AppError = require('./AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateRegisterInput(body = {}) {
  const name = String(body.name || '').trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (name.length < 2) {
    throw new AppError('Informe um nome com pelo menos 2 caracteres.', 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Informe um e-mail válido.', 400);
  }
  if (password.length < 6) {
    throw new AppError('A senha deve ter pelo menos 6 caracteres.', 400);
  }

  return { name, email, password };
}

function validateLoginInput(body = {}) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!email || !password) {
    throw new AppError('Informe e-mail e senha.', 400);
  }

  return { email, password };
}

module.exports = { validateRegisterInput, validateLoginInput };