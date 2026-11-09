import { apiRequest } from './api';

export async function listLists() {
  const data = await apiRequest('/shopping-lists');
  return data.lists;
}

// Devolve { list, sections, items }
export function getListDetail(listId) {
  return apiRequest(`/shopping-lists/${listId}`);
}

// Atualiza as sugestões de reposição e devolve { list, sections, items, sync }
export function syncSmartList() {
  return apiRequest('/shopping-lists/smart/sync', { method: 'POST' });
}

// Título e observações são opcionais
export async function createList({ title, notes }) {
  const data = await apiRequest('/shopping-lists', {
    method: 'POST',
    body: { title, notes },
  });
  return data.list;
}

export async function updateList(listId, { title, notes }) {
  const data = await apiRequest(`/shopping-lists/${listId}`, {
    method: 'PUT',
    body: { title, notes },
  });
  return data.list;
}

export function deleteList(listId) {
  return apiRequest(`/shopping-lists/${listId}`, { method: 'DELETE' });
}

// order: { sections: [ids], items: { none: [ids], "<idDaSecao>": [ids] } }
export function reorderList(listId, order) {
  return apiRequest(`/shopping-lists/${listId}/order`, {
    method: 'PUT',
    body: order,
  });
}

// Interpreta texto como "- Arroz #2 kg". Devolve { result, list, sections, items }
export function importCommands(listId, text) {
  return apiRequest(`/shopping-lists/${listId}/commands`, {
    method: 'POST',
    body: { text },
  });
}