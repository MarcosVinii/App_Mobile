import { apiRequest } from './api';

export async function listRooms() {
  const data = await apiRequest('/rooms');
  return data.rooms;
}

export async function getRoom(roomId) {
  const data = await apiRequest(`/rooms/${roomId}`);
  return data.room;
}

// image: texto base64 (data URL), null para remover ou undefined para não mexer
export async function createRoom({ name, icon, image }) {
  const data = await apiRequest('/rooms', {
    method: 'POST',
    body: { name, icon, image },
  });
  return data.room;
}

export async function updateRoom(roomId, { name, icon, image }) {
  const data = await apiRequest(`/rooms/${roomId}`, {
    method: 'PUT',
    body: { name, icon, image },
  });
  return data.room;
}

export function deleteRoom(roomId) {
  return apiRequest(`/rooms/${roomId}`, { method: 'DELETE' });
}