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

export async function createList(title) {
  const data = await apiRequest('/shopping-lists', {
    method: 'POST',
    body: { title },
  });
  return data.list;
}

export async function renameList(listId, title) {
  const data = await apiRequest(`/shopping-lists/${listId}`, {
    method: 'PUT',
    body: { title },
  });
  return data.list;
}

export function deleteList(listId) {
  return apiRequest(`/shopping-lists/${listId}`, { method: 'DELETE' });
}