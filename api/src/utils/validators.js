const AppError = require('./AppError');
const { UNITS } = require('./units');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ICON_REGEX = /^[a-z0-9-]{1,40}$/;
const MAX_QUANTITY = 1000000;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Converte só números e textos numéricos; qualquer outra coisa vira NaN
function toNumber(value) {
  const isNumeric =
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '');

  return isNumeric ? Number(value) : NaN;
}

function roundQuantity(value) {
  return Math.round(value * 1000) / 1000;
}

function parseId(value, message = 'Identificador inválido.') {
  const id = toNumber(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(message, 400);
  }

  return id;
}

function parseQuantity(value, label) {
  const quantity = toNumber(value);

  if (!Number.isFinite(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    throw new AppError(
      `A ${label} deve ser um número entre 0 e ${MAX_QUANTITY}.`,
      400
    );
  }

  return roundQuantity(quantity);
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

function validateProductInput(body = {}) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const unit = String(body.unit || 'un');

  if (name.length < 2 || name.length > 60) {
    throw new AppError('O nome do produto deve ter entre 2 e 60 caracteres.', 400);
  }
  if (description.length > 200) {
    throw new AppError('A descrição deve ter no máximo 200 caracteres.', 400);
  }
  if (!UNITS.includes(unit)) {
    throw new AppError('Unidade de medida inválida.', 400);
  }

  return {
    name,
    description: description || null,
    unit,
    roomId: parseId(body.room_id, 'Cômodo inválido.'),
    categoryId: parseId(body.category_id, 'Categoria inválida.'),
    quantity: parseQuantity(body.quantity ?? 0, 'quantidade atual'),
    minQuantity: parseQuantity(body.min_quantity ?? 0, 'quantidade mínima'),
  };
}

function validateQuantityDelta(body = {}) {
  const delta = toNumber(body.delta);

  if (!Number.isFinite(delta) || Math.abs(delta) > MAX_QUANTITY) {
    throw new AppError('Informe uma variação de quantidade válida.', 400);
  }

  const roundedDelta = roundQuantity(delta);

  if (roundedDelta === 0) {
    throw new AppError('Informe uma variação de quantidade diferente de zero.', 400);
  }

  return roundedDelta;
}

module.exports = {
  MAX_QUANTITY,
  toNumber,
  roundQuantity,
  parseId,
  validateRegisterInput,
  validateLoginInput,
  validateRoomInput,
  validateProductInput,
  validateQuantityDelta,
};