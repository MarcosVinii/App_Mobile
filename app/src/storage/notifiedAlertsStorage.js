import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFIED_ALERTS_KEY = '@casa_em_ordem:notified_alerts';

// Guarda { idDoProduto: 'low_stock' | 'out_of_stock' } dos produtos que já geraram aviso
export async function loadNotifiedAlerts() {
  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_ALERTS_KEY);

    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

export function saveNotifiedAlerts(alerts) {
  return AsyncStorage.setItem(NOTIFIED_ALERTS_KEY, JSON.stringify(alerts));
}