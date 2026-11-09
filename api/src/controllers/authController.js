const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function me(req, res, next) {
  try {
    const user = authService.getProfile(req.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

function updateMe(req, res, next) {
  try {
    const user = authService.updateProfile(req.userId, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    await authService.changePassword(req.userId, req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me, updateMe, changePassword };