// Transforma seções e itens da API em uma lista única de "linhas" para o FlatList.
// Ordem: itens sem seção primeiro; depois cada seção (ou divisor) com seus itens.
export function buildListRows(sections, items) {
  const itemsBySection = new Map();

  items.forEach((item) => {
    const key = item.section_id ?? 'none';

    if (!itemsBySection.has(key)) {
      itemsBySection.set(key, []);
    }
    itemsBySection.get(key).push(item);
  });

  const rows = [];

  function addItemRows(key) {
    (itemsBySection.get(key) || []).forEach((item) => {
      rows.push({ type: 'item', key: `item-${item.id}`, item });
    });
  }

  addItemRows('none');

  sections.forEach((section) => {
    rows.push({ type: section.type, key: `${section.type}-${section.id}`, section });

    if (section.type === 'section') {
      addItemRows(section.id);
    }
  });

  return rows;
}

export function buildProgressText(items) {
  if (items.length === 0) return '';

  const purchased = items.filter((item) => item.status === 'purchased').length;

  return `${purchased} de ${items.length} ${items.length === 1 ? 'item comprado' : 'itens comprados'}`;
}