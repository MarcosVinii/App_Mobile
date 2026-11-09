const AppError = require('./AppError');
const { EMAIL_REGEX, normalizeEmail } = require('./validators');

function validateProfileInput(body = {}) {
  const name = String(body.name || '').trim();
  const email = normalizeEmail(body.email);

  if (name.length < 2) {
    throw new AppError('Informe um nome com pelo menos 2 caracteres.', 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Informe um e-mail válido.', 400);
  }

  return { name, email };
}

function validatePasswordChangeInput(body = {}) {
  const currentPassword = String(body.current_password || '');
  const newPassword = String(body.new_password || '');

  if (!currentPassword) {
    throw new AppError('Informe a senha atual.', 400);
  }
  if (newPassword.length < 6) {
    throw new AppError('A nova senha deve ter pelo menos 6 caracteres.', 400);
  }
  if (newPassword === currentPassword) {
    throw new AppError('A nova senha deve ser diferente da atual.', 400);
  }

  return { currentPassword, newPassword };
}

module.exports = { validateProfileInput, validatePasswordChangeInput };