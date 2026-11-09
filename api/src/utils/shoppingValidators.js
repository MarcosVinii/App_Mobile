const AppError = require('./AppError');
const { UNITS } = require('./units');
const {
  MAX_QUANTITY,
  toNumber,
  roundQuantity,
  parseId,
} = require('./validators');

const SECTION_TYPES = ['section', 'divider'];
const ITEM_STATUSES = ['pending', 'purchased'];
const MAX_NOTES_LENGTH = 2000;

function parseOptionalId(value, message) {
  if (value === undefined || value === null) return null;

  return parseId(value, message);
}

// Título e observações são opcionais.
// title: texto ou null (sem título); notes: texto ou undefined (não enviado)
function validateListInput(body = {}) {
  const title =
    body.title === undefined || body.title === null ? '' : String(body.title).trim();

  if (title !== '' && (title.length < 2 || title.length > 60)) {
    throw new AppError('O título da lista deve ter entre 2 e 60 caracteres.', 400);
  }

  const notes =
    body.notes === undefined || body.notes === null ? undefined : String(body.notes).trim();

  if (notes !== undefined && notes.length > MAX_NOTES_LENGTH) {
    throw new AppError(
      `As observações devem ter no máximo ${MAX_NOTES_LENGTH} caracteres.`,
      400
    );
  }

  return { title: title || null, notes };
}

function validateSectionInput(body = {}) {
  const type = String(body.type || 'section');

  if (!SECTION_TYPES.includes(type)) {
    throw new AppError('Tipo de seção inválido.', 400);
  }

  if (type === 'divider') {
    return { type, title: null };
  }

  const title = String(body.title || '').trim();

  if (title.length < 2 || title.length > 40) {
    throw new AppError('O título da seção deve ter entre 2 e 40 caracteres.', 400);
  }

  return { type, title };
}

function validateItemInput(body = {}) {
  const name = String(body.name || '').trim();
  const unit = String(body.unit || 'un');

  if (name.length < 2 || name.length > 60) {
    throw new AppError('O nome do item deve ter entre 2 e 60 caracteres.', 400);
  }
  if (!UNITS.includes(unit)) {
    throw new AppError('Unidade de medida inválida.', 400);
  }

  const rawQuantity = toNumber(body.quantity ?? 1);
  const quantity = roundQuantity(rawQuantity);

  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_QUANTITY) {
    throw new AppError(
      `A quantidade deve ser um número maior que 0 e até ${MAX_QUANTITY}.`,
      400
    );
  }

  return { name, unit, quantity };
}

function validateStatusInput(body = {}) {
  const status = String(body.status || '');

  if (!ITEM_STATUSES.includes(status)) {
    throw new AppError('Situação inválida. Use "pending" ou "purchased".', 400);
  }

  return status;
}

function parseIdArray(value, label) {
  if (!Array.isArray(value)) {
    throw new AppError(
      `Informe a lista "${label}" com os identificadores na nova ordem.`,
      400
    );
  }

  return value.map((id) => parseId(id));
}

// Esperado: { sections: [ids], items: { none: [ids], "<idDaSecao>": [ids] } }
function validateOrderInput(body = {}) {
  const sectionIds = parseIdArray(body.sections, 'sections');

  const itemsMap = body.items;
  const isPlainObject =
    itemsMap !== null && typeof itemsMap === 'object' && !Array.isArray(itemsMap);

  if (!isPlainObject) {
    throw new AppError('Informe o objeto "items" com os itens de cada seção.', 400);
  }

  const itemGroups = Object.entries(itemsMap).map(([key, ids]) => ({
    sectionId: key === 'none' ? null : parseId(key, 'Seção inválida.'),
    itemIds: parseIdArray(ids, `items.${key}`),
  }));

  return { sectionIds, itemGroups };
}

module.exports = {
  parseOptionalId,
  validateListInput,
  validateSectionInput,
  validateItemInput,
  validateStatusInput,
  validateOrderInput,
};