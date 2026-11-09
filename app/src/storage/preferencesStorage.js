import AsyncStorage from '@react-native-async-storage/async-storage';

const SMART_ORGANIZATION_KEY = '@casa_em_ordem:smart_organization';
const STOCK_NOTIFICATIONS_KEY = '@casa_em_ordem:stock_notifications';

// Por padrão a organização inteligente começa ligada
export async function getSmartOrganization() {
  const stored = await AsyncStorage.getItem(SMART_ORGANIZATION_KEY);

  return stored === null ? true : stored === 'true';
}

export function saveSmartOrganization(value) {
  return AsyncStorage.setItem(SMART_ORGANIZATION_KEY, String(value));
}

// Por padrão os alertas de estoque começam desligados (o usuário precisa autorizar)
export async function getStockNotifications() {
  const stored = await AsyncStorage.getItem(STOCK_NOTIFICATIONS_KEY);

  return stored === 'true';
}

export function saveStockNotifications(value) {
  return AsyncStorage.setItem(STOCK_NOTIFICATIONS_KEY, String(value));
}