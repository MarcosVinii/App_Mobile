import { apiRequest } from './api';

export async function listRooms() {
  const data = await apiRequest('/rooms');
  return data.rooms;
}

export async function getRoom(roomId) {
  const data = await apiRequest(`/rooms/${roomId}`);
  return data.room;
}

export async function createRoom({ name, icon }) {
  const data = await apiRequest('/rooms', {
    method: 'POST',
    body: { name, icon },
  });
  return data.room;
}

export async function updateRoom(roomId, { name, icon }) {
  const data = await apiRequest(`/rooms/${roomId}`, {
    method: 'PUT',
    body: { name, icon },
  });
  return data.room;
}

export function deleteRoom(roomId) {
  return apiRequest(`/rooms/${roomId}`, { method: 'DELETE' });
}