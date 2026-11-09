import { apiRequest } from './api';

export async function createItem(item) {
  const data = await apiRequest('/shopping-items', {
    method: 'POST',
    body: item,
  });
  return data.item;
}

export async function updateItem(itemId, item) {
  const data = await apiRequest(`/shopping-items/${itemId}`, {
    method: 'PUT',
    body: item,
  });
  return data.item;
}

export function deleteItem(itemId) {
  return apiRequest(`/shopping-items/${itemId}`, { method: 'DELETE' });
}

// status: 'pending' ou 'purchased'.
// Devolve { item, outcome }; outcome diz o que aconteceu com o estoque.
export function changeItemStatus(itemId, status, smartOrganization) {
  return apiRequest(`/shopping-items/${itemId}/status`, {
    method: 'PATCH',
    body: { status, smart_organization: smartOrganization },
  });
}