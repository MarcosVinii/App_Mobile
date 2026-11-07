const AppError = require('./AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ICON_REGEX = /^[a-z0-9-]{1,40}$/;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Identificador inválido.', 400);
  }

  return id;
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

function validateRoomInput(body = {}) {
  const name = String(body.name || '').trim();
  const icon = String(body.icon || 'door').trim();

  if (name.length < 2 || name.length > 40) {
    throw new AppError('O nome do cômodo deve ter entre 2 e 40 caracteres.', 400);
  }
  if (!ICON_REGEX.test(icon)) {
    throw new AppError('Ícone inválido.', 400);
  }

  return { name, icon };
}

module.exports = {
  parseId,
  validateRegisterInput,
  validateLoginInput,
  validateRoomInput,
};