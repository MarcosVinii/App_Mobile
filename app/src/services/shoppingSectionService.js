import { apiRequest } from './api';

// type: 'section' (com título) ou 'divider' (divisor, sem título)
export async function createSection(listId, { title, type = 'section' }) {
  const data = await apiRequest(`/shopping-lists/${listId}/sections`, {
    method: 'POST',
    body: { title, type },
  });
  return data.section;
}

export async function renameSection(sectionId, title) {
  const data = await apiRequest(`/shopping-sections/${sectionId}`, {
    method: 'PUT',
    body: { title },
  });
  return data.section;
}

export function deleteSection(sectionId) {
  return apiRequest(`/shopping-sections/${sectionId}`, { method: 'DELETE' });
}