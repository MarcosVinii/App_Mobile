import { statusColors } from '../theme/theme';

// Situação geral de um cômodo, sempre com ícone e texto (não só cor)
export function getRoomStatus(room) {
  if (room.out_of_stock_products > 0) {
    return { label: 'Faltam produtos', icon: 'alert-circle', color: statusColors.outOfStock };
  }

  if (room.low_stock_products > 0) {
    return { label: 'Atenção ao estoque', icon: 'alert', color: statusColors.lowStock };
  }

  if (room.total_products === 0) {
    return { label: 'Sem produtos ainda', icon: 'information-outline', color: '#6B6B6B' };
  }

  return { label: 'Tudo em ordem', icon: 'check-circle-outline', color: statusColors.normal };
}