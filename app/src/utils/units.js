import { formatNumber } from './numbers';

// "step" é quanto os botões de adicionar e diminuir mudam por toque
export const UNITS = [
  { code: 'un', label: 'Unidade', short: 'un', step: 1 },
  { code: 'pct', label: 'Pacote', short: 'pct', step: 1 },
  { code: 'cx', label: 'Caixa', short: 'cx', step: 1 },
  { code: 'kg', label: 'Quilograma (kg)', short: 'kg', step: 0.5 },
  { code: 'g', label: 'Gramas (g)', short: 'g', step: 100 },
  { code: 'l', label: 'Litros (L)', short: 'L', step: 0.5 },
  { code: 'ml', label: 'Mililitros (ml)', short: 'ml', step: 100 },
];

export const DEFAULT_UNIT = 'un';

function findUnit(code) {
  return UNITS.find((unit) => unit.code === code) || UNITS[0];
}

export function getUnitShort(code) {
  return findUnit(code).short;
}

export function getQuantityStep(code) {
  return findUnit(code).step;
}

export function formatQuantity(quantity, unitCode) {
  return `${formatNumber(quantity)} ${getUnitShort(unitCode)}`;
}