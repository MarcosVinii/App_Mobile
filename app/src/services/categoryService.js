import { apiRequest } from './api';

export async function listCategories() {
  const data = await apiRequest('/categories');
  return data.categories;
}