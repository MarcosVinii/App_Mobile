import { Platform } from 'react-native';

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'code,product_name,brands,quantity';
const TIMEOUT_MS = 12000;
const MAX_RESULTS = 8;

class FoodApiError extends Error {}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = { Accept: 'application/json' };

  // O Open Food Facts pede que o app se identifique (o navegador não permite definir isso)
  if (Platform.OS !== 'web') {
    headers['User-Agent'] = 'CasaEmOrdem/1.0 (projeto academico)';
  }

  try {
    const response = await fetch(url, { headers, signal: controller.signal });

    if (!response.ok) {
      throw new FoodApiError(
        `O Open Food Facts respondeu com erro (${response.status}). Tente novamente mais tarde.`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof FoodApiError) throw error;

    if (error.name === 'AbortError') {
      throw new FoodApiError('A consulta demorou demais. Tente novamente.');
    }

    throw new FoodApiError(
      'Não foi possível consultar o Open Food Facts. Verifique sua conexão ou cadastre o produto manualmente.'
    );
  } finally {
    clearTimeout(timer);
  }
}

function toFood(raw) {
  const name = String(raw.product_name || '').trim().slice(0, 60);
  const brand = String(raw.brands || '').split(',')[0].trim();
  const quantity = String(raw.quantity || '').trim();

  const description = [brand && `Marca: ${brand}`, quantity && `Embalagem: ${quantity}`]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 200);

  return { barcode: raw.code || null, name, brand, quantity, description };
}

// Pesquisa alimentos pelo nome. Devolve [{ barcode, name, brand, quantity, description }]
export async function searchFoods(query) {
  const params = new URLSearchParams({
    search_terms: query.trim(),
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '12',
    fields: FIELDS,
    lc: 'pt',
  });

  const data = await fetchJson(`${SEARCH_URL}?${params.toString()}`);

  return (data.products || [])
    .filter((raw) => raw.product_name && raw.product_name.trim())
    .map(toFood)
    .slice(0, MAX_RESULTS);
}

// Preparado para a futura leitura de código de barras (ainda não ligado a nenhuma tela)
export async function getFoodByBarcode(barcode) {
  const data = await fetchJson(
    `${PRODUCT_URL}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`
  );

  return data.status === 1 && data.product ? toFood(data.product) : null;
}