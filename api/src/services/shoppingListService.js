const shoppingListRepository = require('../repositories/shoppingListRepository');
const shoppingSectionRepository = require('../repositories/shoppingSectionRepository');
const shoppingItemRepository = require('../repositories/shoppingItemRepository');
const { runInTransaction } = require('../database/transaction');
const AppError = require('../utils/AppError');
const {
  validateListInput,
  validateOrderInput,
} = require('../utils/shoppingValidators');

function getList(userId, listId) {
  const list = shoppingListRepository.findByIdForUser(listId, userId);

  if (!list) {
    throw new AppError('Lista não encontrada.', 404);
  }

  return list;
}

function assertCustomList(list) {
  if (list.kind !== 'custom') {
    throw new AppError('A lista inteligente não pode ser renomeada nem excluída.', 400);
  }
}

function assertSameIds(received, expected, label) {
  const expectedIds = new Set(expected);
  const receivedIds = new Set(received);

  const isSame =
    received.length === expected.length &&
    receivedIds.size === received.length &&
    received.every((id) => expectedIds.has(id));

  if (!isSame) {
    throw new AppError(
      `A nova ordem deve conter exatamente todos os ${label} da lista, sem repetir.`,
      400
    );
  }
}

function listLists(userId) {
  return shoppingListRepository.findAllCustomByUser(userId);
}

function getListDetail(userId, listId) {
  const list = getList(userId, listId);

  return {
    list,
    sections: shoppingSectionRepository.findAllByList(listId),
    items: shoppingItemRepository.findAllByList(listId),
  };
}

function createList(userId, body) {
  const { title } = validateListInput(body);

  return shoppingListRepository.create({ userId, title });
}

function renameList(userId, listId, body) {
  assertCustomList(getList(userId, listId));

  const { title } = validateListInput(body);

  return shoppingListRepository.updateTitle(listId, userId, title);
}

function deleteList(userId, listId) {
  assertCustomList(getList(userId, listId));
  shoppingListRepository.remove(listId, userId);
}

function reorderList(userId, listId, body) {
  getList(userId, listId);

  const { sectionIds, itemGroups } = validateOrderInput(body);

  const sections = shoppingSectionRepository.findAllByList(listId);
  const items = shoppingItemRepository.findAllByList(listId);

  assertSameIds(sectionIds, sections.map((section) => section.id), 'seções');
  assertSameIds(
    itemGroups.flatMap((group) => group.itemIds),
    items.map((item) => item.id),
    'itens'
  );

  // Itens só podem ficar "sem seção" ou dentro de uma seção de verdade (não divisor)
  const realSectionIds = new Set(
    sections.filter((section) => section.type === 'section').map((section) => section.id)
  );

  itemGroups.forEach((group) => {
    const isInvalidSection = group.sectionId !== null && !realSectionIds.has(group.sectionId);

    if (isInvalidSection && group.itemIds.length > 0) {
      throw new AppError('Itens só podem ficar dentro de seções com título.', 400);
    }
  });

  runInTransaction(() => {
    sectionIds.forEach((id, index) => {
      shoppingSectionRepository.updatePosition(id, index + 1);
    });

    itemGroups.forEach((group) => {
      group.itemIds.forEach((id, index) => {
        shoppingItemRepository.updatePlacement(id, group.sectionId, index + 1);
      });
    });
  });

  return getListDetail(userId, listId);
}

module.exports = {
  listLists,
  getList,
  getListDetail,
  createList,
  renameList,
  deleteList,
  reorderList,
};