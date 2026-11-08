import { apiRequest } from './api';

export async function listProducts(roomId) {
  const query = roomId ? `?room_id=${roomId}` : '';
  const data = await apiRequest(`/products${query}`);
  return data.products;
}

export async function getProduct(productId) {
  const data = await apiRequest(`/products/${productId}`);
  return data.product;
}

export async function createProduct(product) {
  const data = await apiRequest('/products', {
    method: 'POST',
    body: product,
  });
  return data.product;
}

export async function updateProduct(productId, product) {
  const data = await apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: product,
  });
  return data.product;
}

// Envia só a variação (delta); quem soma é o banco, de forma segura
export async function changeQuantity(productId, delta) {
  const data = await apiRequest(`/products/${productId}/quantity`, {
    method: 'PATCH',
    body: { delta },
  });
  return data.product;
}

export function deleteProduct(productId) {
  return apiRequest(`/products/${productId}`, { method: 'DELETE' });
}