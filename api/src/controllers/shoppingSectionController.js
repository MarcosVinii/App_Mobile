const shoppingSectionService = require('../services/shoppingSectionService');
const { parseId } = require('../utils/validators');

function sectionId(req) {
  return parseId(req.params.id, 'Seção inválida.');
}

function rename(req, res, next) {
  try {
    const section = shoppingSectionService.renameSection(
      req.userId,
      sectionId(req),
      req.body
    );
    res.json({ section });
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    shoppingSectionService.deleteSection(req.userId, sectionId(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { rename, remove };