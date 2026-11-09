// Funções puras para reorganizar seções e itens de uma lista.
// "groups" tem uma chave por seção (e "none" para itens sem seção),
// cada uma com os ids dos itens na ordem em que aparecem.

export function buildGroups(sections, items) {
  const groups = { none: [] };

  sections.forEach((section) => {
    if (section.type === 'section') {
      groups[section.id] = [];
    }
  });

  items.forEach((item) => {
    const key = item.section_id ?? 'none';

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item.id);
  });

  return groups;
}

// direction: -1 sobe uma posição, 1 desce uma posição
export function moveInArray(array, value, direction) {
  const index = array.indexOf(value);
  const target = index + direction;

  if (index < 0 || target < 0 || target >= array.length) {
    return array;
  }

  const copy = [...array];
  [copy[index], copy[target]] = [copy[target], copy[index]];

  return copy;
}

export function moveItemToGroup(groups, itemId, fromKey, toKey) {
  return {
    ...groups,
    [fromKey]: groups[fromKey].filter((id) => id !== itemId),
    [toKey]: [...groups[toKey], itemId],
  };
}

export function getMoveState(array, value) {
  const index = array.indexOf(value);

  return {
    canMoveUp: index > 0,
    canMoveDown: index >= 0 && index < array.length - 1,
  };
}