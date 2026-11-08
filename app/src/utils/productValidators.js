import { parseDecimal } from './numbers';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;
const MAX_QUANTITY = 1000000;

function removeEmpty(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

function getQuantityError(text, description) {
  const value = parseDecimal(text);

  if (Number.isNaN(value) || value < 0 || value > MAX_QUANTITY) {
    return `Informe ${description} (um número a partir de 0).`;
  }

  return null;
}

export function validateProductForm({
  name,
  roomId,
  categoryId,
  quantity,
  minQuantity,
}) {
  const nameLength = name.trim().length;
  const hasValidName = nameLength >= MIN_NAME_LENGTH && nameLength <= MAX_NAME_LENGTH;

  return removeEmpty({
    name: hasValidName
      ? null
      : `O nome deve ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`,
    room: roomId ? null : 'Escolha o cômodo do produto.',
    category: categoryId ? null : 'Escolha uma categoria.',
    quantity: getQuantityError(quantity, 'a quantidade atual'),
    minQuantity: getQuantityError(minQuantity, 'a quantidade mínima'),
  });
}