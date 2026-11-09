import { apiRequest } from './api';

// Devolve { items, pending_count }; cada item traz "candidates" (produtos parecidos)
export function getPending() {
  return apiRequest('/purchase-warehouse');
}

export async function getPendingCount() {
  const data = await apiRequest('/purchase-warehouse/count');
  return data.pending_count;
}

export function discardItem(itemId) {
  return apiRequest(`/purchase-warehouse/${itemId}`, { method: 'DELETE' });
}

// Soma a quantidade ao estoque de um produto existente. Devolve { item, product }
export function organizeWithProduct(itemId, productId) {
  return apiRequest(`/purchase-warehouse/${itemId}/organize`, {
    method: 'POST',
    body: { product_id: productId },
  });
}

// Cria um produto novo com a quantidade comprada. Devolve { item, product }
export function organizeWithNewProduct(itemId, product) {
  return apiRequest(`/purchase-warehouse/${itemId}/organize`, {
    method: 'POST',
    body: { product },
  });
}