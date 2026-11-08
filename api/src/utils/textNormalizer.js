// Normaliza um texto para comparação: sem acentos, minúsculo e sem espaços extras
function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

module.exports = { normalizeText };