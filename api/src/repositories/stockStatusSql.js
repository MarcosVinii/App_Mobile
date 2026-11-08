// Regra única da situação do estoque. Usa o alias "p" da tabela products.
const STOCK_STATUS_SQL = `CASE
  WHEN p.quantity <= 0 THEN 'out_of_stock'
  WHEN p.quantity <= p.min_quantity THEN 'low_stock'
  ELSE 'normal'
END`;

module.exports = { STOCK_STATUS_SQL };