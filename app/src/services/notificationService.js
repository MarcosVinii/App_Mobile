import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { loadNotifiedAlerts, saveNotifiedAlerts } from '../storage/notifiedAlertsStorage';

const CHANNEL_ID = 'stock-alerts';
const MAX_NAMES_SHOWN = 3;

// Gravidade: um aviso novo só sai se o produto entrou em alerta ou piorou
const SEVERITY = { low_stock: 1, out_of_stock: 2 };

// Notificações locais não existem na versão web
const isSupported = Platform.OS !== 'web';

if (isSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function areNotificationsSupported() {
  return isSupported;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Alertas de estoque',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Pede permissão ao usuário. Devolve true se foi concedida.
export async function requestNotificationPermission() {
  if (!isSupported) return false;

  try {
    await ensureAndroidChannel();

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    return false;
  }
}

// Esquece os avisos já enviados (usado ao desligar os alertas)
export function resetNotifiedAlerts() {
  return saveNotifiedAlerts({});
}

function summarize(names) {
  const shown = names.slice(0, MAX_NAMES_SHOWN).join(', ');
  const extra = names.length - MAX_NAMES_SHOWN;

  return extra > 0 ? `${shown} e mais ${extra}` : shown;
}

function buildBody(freshProducts) {
  const out = freshProducts.filter((p) => p.stock_status === 'out_of_stock').map((p) => p.name);
  const low = freshProducts.filter((p) => p.stock_status === 'low_stock').map((p) => p.name);
  const parts = [];

  if (out.length > 0) parts.push(`Sem estoque: ${summarize(out)}`);
  if (low.length > 0) parts.push(`Estoque baixo: ${summarize(low)}`);

  return `${parts.join('. ')}.`;
}

// Envia UMA notificação resumindo só o que é novo desde a última verificação.
// Devolve true se uma notificação foi enviada.
export async function notifyStockAlerts(products) {
  if (!isSupported) return false;

  const previous = await loadNotifiedAlerts();
  const current = {};
  const fresh = [];

  products
    .filter((product) => SEVERITY[product.stock_status])
    .forEach((product) => {
      current[product.id] = product.stock_status;

      const before = previous[product.id];
      const isNewOrWorse = !before || SEVERITY[product.stock_status] > SEVERITY[before];

      if (isNewOrWorse) fresh.push(product);
    });

  // Produtos que voltaram ao normal saem do registro e podem avisar de novo no futuro
  await saveNotifiedAlerts(current);

  if (fresh.length === 0) return false;

  try {
    await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'O estoque precisa de atenção',
        body: buildBody(fresh),
      },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
    return true;
  } catch (error) {
    return false;
  }
}