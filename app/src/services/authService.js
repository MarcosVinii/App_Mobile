import { apiRequest } from './api';

export function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

export function register(name, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
  });
}

export async function fetchCurrentUser() {
  const data = await apiRequest('/auth/me');
  return data.user;
}

export async function updateProfile(name, email) {
  const data = await apiRequest('/auth/me', {
    method: 'PUT',
    body: { name, email },
  });
  return data.user;
}

export function changePassword(currentPassword, newPassword) {
  return apiRequest('/auth/password', {
    method: 'PUT',
    body: { current_password: currentPassword, new_password: newPassword },
  });
}