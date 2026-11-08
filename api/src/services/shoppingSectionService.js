const shoppingListRepository = require('../repositories/shoppingListRepository');
const shoppingSectionRepository = require('../repositories/shoppingSectionRepository');
const AppError = require('../utils/AppError');
const { validateSectionInput } = require('../utils/shoppingValidators');

function getSection(userId, sectionId) {
  const section = shoppingSectionRepository.findByIdForUser(sectionId, userId);

  if (!section) {
    throw new AppError('Seção não encontrada.', 404);
  }

  return section;
}

function createSection(userId, listId, body) {
  if (!shoppingListRepository.findByIdForUser(listId, userId)) {
    throw new AppError('Lista não encontrada.', 404);
  }

  const data = validateSectionInput(body);

  return shoppingSectionRepository.create({ listId, ...data });
}

function renameSection(userId, sectionId, body) {
  const section = getSection(userId, sectionId);

  if (section.type !== 'section') {
    throw new AppError('Divisores não têm título.', 400);
  }

  const { title } = validateSectionInput({ title: body?.title, type: 'section' });

  return shoppingSectionRepository.updateTitle(sectionId, title);
}

// Os itens da seção excluída continuam na lista, sem seção
function deleteSection(userId, sectionId) {
  getSection(userId, sectionId);
  shoppingSectionRepository.remove(sectionId);
}

module.exports = { createSection, renameSection, deleteSection };