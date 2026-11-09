// Famílias de unidades que podem ser convertidas entre si.
// factor = quanto vale 1 unidade na unidade-base da família (g ou ml).
const UNIT_CONVERSION = {
  un: { family: 'un', factor: 1 },
  pct: { family: 'pct', factor: 1 },
  cx: { family: 'cx', factor: 1 },
  kg: { family: 'mass', factor: 1000 },
  g: { family: 'mass', factor: 1 },
  l: { family: 'volume', factor: 1000 },
  ml: { family: 'volume', factor: 1 },
};

// Converte uma quantidade de uma unidade para outra.
// Devolve null quando as unidades não são compatíveis (ex.: pacote e kg)
// ou quando o resultado seria zero.
function convertQuantity(quantity, fromUnit, toUnit) {
  const from = UNIT_CONVERSION[fromUnit];
  const to = UNIT_CONVERSION[toUnit];

  if (!from || !to || from.family !== to.family) return null;

  const converted = Math.round(((quantity * from.factor) / to.factor) * 1000) / 1000;

  return converted > 0 ? converted : null;
}

module.exports = { convertQuantity };