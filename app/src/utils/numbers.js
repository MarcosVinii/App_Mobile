// Converte o texto digitado ("2,5" ou "2.5") em número. Texto inválido vira NaN.
export function parseDecimal(text) {
  const normalized = String(text).trim().replace(',', '.');

  if (normalized === '') return NaN;

  return Number(normalized);
}

// Mostra o número no padrão brasileiro (vírgula decimal), até 3 casas.
export function formatNumber(value) {
  return String(Math.round(value * 1000) / 1000).replace('.', ',');
}