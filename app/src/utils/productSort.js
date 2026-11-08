import { getComparableQuantity } from './units';

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Nome (A–Z)', icon: 'sort-alphabetical-ascending' },
  { value: 'name_desc', label: 'Nome (Z–A)', icon: 'sort-alphabetical-descending' },
  { value: 'stock_asc', label: 'Menor estoque', icon: 'sort-numeric-ascending' },
  { value: 'stock_desc', label: 'Maior estoque', icon: 'sort-numeric-descending' },
];

export const DEFAULT_SORT = 'name_asc';

// Quanto menor o número, mais urgente é a situação
const STATUS_RANK = { out_of_stock: 0, low_stock: 1, normal: 2 };

function compareNames(a, b) {
  return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
}

// direction: 1 = menor estoque primeiro, -1 = maior estoque primeiro
function compareByStock(a, b, direction) {
  const statusDiff =
    (STATUS_RANK[a.stock_status] - STATUS_RANK[b.stock_status]) * direction;
  if (statusDiff !== 0) return statusDiff;

  const quantityA = getComparableQuantity(a.quantity, a.unit);
  const quantityB = getComparableQuantity(b.quantity, b.unit);

  // Famílias diferentes (ex.: kg e L) não são comparadas pela quantidade
  if (quantityA.familyIndex !== quantityB.familyIndex) {
    return quantityA.familyIndex - quantityB.familyIndex;
  }

  const amountDiff = (quantityA.amount - quantityB.amount) * direction;
  if (amountDiff !== 0) return amountDiff;

  return compareNames(a, b);
}

export function sortProducts(products, sortKey) {
  const sorted = [...products];

  switch (sortKey) {
    case 'name_desc':
      return sorted.sort((a, b) => compareNames(b, a));
    case 'stock_asc':
      return sorted.sort((a, b) => compareByStock(a, b, 1));
    case 'stock_desc':
      return sorted.sort((a, b) => compareByStock(a, b, -1));
    default:
      return sorted.sort(compareNames);
  }
}