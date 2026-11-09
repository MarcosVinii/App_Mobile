import { apiRequest } from './api';

// status: 'pending' ou 'purchased'
export async function changeItemStatus(itemId, status) {
  const data = await apiRequest(`/shopping-items/${itemId}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return data.item;
}