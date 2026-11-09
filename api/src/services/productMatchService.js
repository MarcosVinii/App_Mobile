const { normalizeText } = require('../utils/textNormalizer');

function toWordSet(normalizedText) {
  return new Set(normalizedText.split(' ').filter(Boolean));
}

function isSubset(smaller, larger) {
  return [...smaller].every((word) => larger.has(word));
}

// Procura produtos parecidos com um nome.
// exact: nome idêntico (ignorando maiúsculas, acentos e espaços).
// similar: um nome contém todas as palavras do outro (ex.: "arroz" e "arroz integral").
function findMatches(products, name) {
  const normalizedName = normalizeText(name);
  const nameWords = toWordSet(normalizedName);
  const exact = [];
  const similar = [];

  products.forEach((product) => {
    const productName = normalizeText(product.name);

    if (productName === normalizedName) {
      exact.push(product);
      return;
    }

    const productWords = toWordSet(productName);
    const [smaller, larger] =
      nameWords.size <= productWords.size
        ? [nameWords, productWords]
        : [productWords, nameWords];

    if (smaller.size > 0 && isSubset(smaller, larger)) {
      similar.push(product);
    }
  });

  return { exact, similar };
}

function toCandidate(product, match) {
  return {
    id: product.id,
    name: product.name,
    room_name: product.room_name,
    quantity: product.quantity,
    unit: product.unit,
    match,
  };
}

function toCandidates({ exact, similar }) {
  return [
    ...exact.map((product) => toCandidate(product, 'exact')),
    ...similar.map((product) => toCandidate(product, 'similar')),
  ].slice(0, 5);
}

module.exports = { findMatches, toCandidates };