const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function removeEmpty(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

function getEmailError(email) {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Informe um e-mail válido.';
  return null;
}

function getNewPasswordError(password) {
  if (!password) return 'Informe uma senha.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export function validateLoginForm({ email, password }) {
  return removeEmpty({
    email: getEmailError(email),
    password: password ? null : 'Informe sua senha.',
  });
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  return removeEmpty({
    name: name.trim().length < 2 ? 'Informe seu nome.' : null,
    email: getEmailError(email),
    password: getNewPasswordError(password),
    confirmPassword:
      confirmPassword !== password ? 'As senhas não coincidem.' : null,
  });
}