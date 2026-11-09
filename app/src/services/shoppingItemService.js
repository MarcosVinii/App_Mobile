import { apiRequest } from './api';

// status: 'pending' ou 'purchased'.
// Devolve { item, outcome }; outcome diz o que aconteceu com o estoque.
export function changeItemStatus(itemId, status, smartOrganization) {
  return apiRequest(`/shopping-items/${itemId}/status`, {
    method: 'PATCH',
    body: { status, smart_organization: smartOrganization },
  });
}