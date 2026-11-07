const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../utils/validators');

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign({ sub: String(user.id) }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

async function register(body) {
  const { name, email, password } = validateRegisterInput(body);

  if (userRepository.findByEmail(email)) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userRepository.create({ name, email, passwordHash });

  return { user, token: generateToken(user) };
}

async function login(body) {
  const { email, password } = validateLoginInput(body);

  const userRow = userRepository.findByEmail(email);
  const passwordMatches = userRow
    ? await bcrypt.compare(password, userRow.password_hash)
    : false;

  if (!passwordMatches) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const user = userRepository.findById(userRow.id);
  return { user, token: generateToken(user) };
}

function getProfile(userId) {
  const user = userRepository.findById(userId);

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return user;
}

module.exports = { register, login, getProfile };