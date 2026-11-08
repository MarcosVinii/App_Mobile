import { statusColors } from '../theme/theme';

const STOCK_STATUS_INFO = {
  out_of_stock: {
    label: 'Sem estoque',
    icon: 'alert-circle',
    color: statusColors.outOfStock,
  },
  low_stock: {
    label: 'Estoque baixo',
    icon: 'alert',
    color: statusColors.lowStock,
  },
  normal: {
    label: 'Estoque normal',
    icon: 'check-circle-outline',
    color: statusColors.normal,
  },
};

export function getStockStatusInfo(status) {
  return STOCK_STATUS_INFO[status] || STOCK_STATUS_INFO.normal;
}

export function isAlertStatus(status) {
  return status === 'out_of_stock' || status === 'low_stock';
}