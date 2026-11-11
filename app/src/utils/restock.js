// Quantidade sugerida para repor um produto: até o dobro do mínimo (e no mínimo 1)
export function suggestRestockQuantity(product) {
  const target = Math.max(product.min_quantity * 2, 1);
  const missing = Math.round((target - product.quantity) * 1000) / 1000;

  return missing > 0 ? missing : 1;
}