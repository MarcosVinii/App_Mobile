const categoryRepository = require('../repositories/categoryRepository');

function list(req, res, next) {
  try {
    res.json({ categories: categoryRepository.findAll() });
  } catch (error) {
    next(error);
  }
}

module.exports = { list };