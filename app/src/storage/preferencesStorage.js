import AsyncStorage from '@react-native-async-storage/async-storage';

const SMART_ORGANIZATION_KEY = '@casa_em_ordem:smart_organization';

// Por padrão a organização inteligente começa ligada
export async function getSmartOrganization() {
  const stored = await AsyncStorage.getItem(SMART_ORGANIZATION_KEY);

  return stored === null ? true : stored === 'true';
}

export function saveSmartOrganization(value) {
  return AsyncStorage.setItem(SMART_ORGANIZATION_KEY, String(value));
}