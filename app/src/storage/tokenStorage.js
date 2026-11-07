import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@casa_em_ordem:token';

export function saveToken(token) {
  return AsyncStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  return AsyncStorage.removeItem(TOKEN_KEY);
}