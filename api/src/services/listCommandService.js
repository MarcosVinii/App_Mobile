const shoppingSectionRepository = require('../repositories/shoppingSectionRepository');
const shoppingItemRepository = require('../repositories/shoppingItemRepository');
const shoppingListService = require('./shoppingListService');
const { runInTransaction } = require('../database/transaction');
const AppError = require('../utils/AppError');
const { normalizeText } = require('../utils/textNormalizer');
const { parseListCommands } = require('../utils/listCommandParser');
const {
  validateItemInput,
  validateSectionInput,
} = require('../utils/shoppingValidators');

const MAX_TEXT_LENGTH = 5000;
const MAX_ENTRIES = 200;

function findSectionByTitle(sections, title) {
  const normalizedTitle = normalizeText(title);

  return sections.find(
    (section) => section.type === 'section' && normalizeText(section.title) === normalizedTitle
  );
}

function addDivider(context) {
  const lastSection = context.sections[context.sections.length - 1];

  if (lastSection && lastSection.type === 'divider') {
    throw new AppError('Já existe um divisor no fim da lista.', 409);
  }

  const divider = shoppingSectionRepository.create({
    listId: context.listId,
    type: 'divider',
    title: null,
  });

  context.sections.push(divider);
  context.result.added_dividers += 1;
}

function openSection(context, entry) {
  // Se o título for inválido, os itens seguintes ficam sem seção
  context.currentSectionId = null;

  const { title } = validateSectionInput({ title: entry.title, type: 'section' });
  let section = findSectionByTitle(context.sections, title);

  if (!section) {
    section = shoppingSectionRepository.create({
      listId: context.listId,
      type: 'section',
      title,
    });
    context.sections.push(section);
    context.result.added_sections += 1;
  }

  context.currentSectionId = section.id;
}

function addItem(context, entry) {
  const data = validateItemInput(entry);
  const nameNormalized = normalizeText(data.name);

  if (shoppingItemRepository.findPendingByName(context.listId, nameNormalized)) {
    throw new AppError('Este item já está na lista.', 409);
  }

  shoppingItemRepository.create({
    listId: context.listId,
    sectionId: context.currentSectionId,
    productId: null,
    nameNormalized,
    ...data,
  });
  context.result.added_items += 1;
}

const ENTRY_HANDLERS = {
  divider: addDivider,
  section: openSection,
  item: addItem,
};

function importCommands(userId, listId, body) {
  shoppingListService.getList(userId, listId);

  const text = String(body?.text ?? '');

  if (!text.trim()) {
    throw new AppError('Digite os itens ou comandos da lista.', 400);
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new AppError(`O texto é grande demais (máximo ${MAX_TEXT_LENGTH} caracteres).`, 400);
  }

  const { entries, errors } = parseListCommands(text);

  if (entries.length > MAX_ENTRIES) {
    throw new AppError(`Use no máximo ${MAX_ENTRIES} linhas por vez.`, 400);
  }

  const context = {
    listId,
    sections: shoppingSectionRepository.findAllByList(listId),
    currentSectionId: null,
    result: {
      added_items: 0,
      added_sections: 0,
      added_dividers: 0,
      skipped: [...errors],
    },
  };

  runInTransaction(() => {
    entries.forEach((entry) => {
      try {
        ENTRY_HANDLERS[entry.type](context, entry);
      } catch (error) {
        if (!(error instanceof AppError)) throw error;

        context.result.skipped.push({
          line: entry.line,
          text: entry.text,
          message: error.message,
        });
      }
    });
  });

  context.result.skipped.sort((a, b) => a.line - b.line);

  return { result: context.result, ...shoppingListService.getListDetail(userId, listId) };
}

module.exports = { importCommands };