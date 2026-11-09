const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateProfileForm({ name, email }) {
  const errors = {};

  if (name.trim().length < 2) {
    errors.name = 'Informe seu nome (mínimo 2 letras).';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }

  return errors;
}

export function validatePasswordForm({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Informe a senha atual.';
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (newPassword === currentPassword) {
    errors.newPassword = 'A nova senha deve ser diferente da atual.';
  }
  if (confirmPassword !== newPassword) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  return errors;
}