import { formatNumber } from './numbers';

// step: quanto os botões de adicionar e diminuir mudam por toque
// family e factor: permitem comparar só o que é comparável
//   (kg e g viram gramas; L e ml viram mililitros; un, pct e cx ficam isolados)
export const UNITS = [
  { code: 'un', label: 'Unidade', short: 'un', step: 1, family: 'un', factor: 1 },
  { code: 'pct', label: 'Pacote', short: 'pct', step: 1, family: 'pct', factor: 1 },
  { code: 'cx', label: 'Caixa', short: 'cx', step: 1, family: 'cx', factor: 1 },
  { code: 'kg', label: 'Quilograma (kg)', short: 'kg', step: 0.5, family: 'mass', factor: 1000 },
  { code: 'g', label: 'Gramas (g)', short: 'g', step: 100, family: 'mass', factor: 1 },
  { code: 'l', label: 'Litros (L)', short: 'L', step: 0.5, family: 'volume', factor: 1000 },
  { code: 'ml', label: 'Mililitros (ml)', short: 'ml', step: 100, family: 'volume', factor: 1 },
];

export const DEFAULT_UNIT = 'un';

const FAMILIES = [...new Set(UNITS.map((unit) => unit.family))];

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

// Devolve a família da unidade e a quantidade na unidade-base da família
export function getComparableQuantity(quantity, unitCode) {
  const unit = findUnit(unitCode);

  return {
    familyIndex: FAMILIES.indexOf(unit.family),
    amount: quantity * unit.factor,
  };
}