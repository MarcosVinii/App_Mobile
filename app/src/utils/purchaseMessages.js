import { formatQuantity } from './units';

// Traduz o resultado de marcar/desmarcar uma compra em uma mensagem para o usuário
export function getPurchaseFeedback(outcome) {
  switch (outcome?.type) {
    case 'stock_updated':
      return {
        message: `Estoque atualizado: ${outcome.product.name} agora tem ${formatQuantity(
          outcome.product.quantity,
          outcome.product.unit
        )}.`,
        type: 'success',
      };
    case 'warehouse':
      return { message: 'Produto adicionado ao Armazém.', type: 'info' };
    case 'stock_reverted':
      return { message: 'Compra desfeita: o estoque foi ajustado.', type: 'info' };
    case 'warehouse_removed':
      return { message: 'Item removido do Armazém.', type: 'info' };
    default:
      return null;
  }
}