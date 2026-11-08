import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

import { formatQuantity } from '../utils/units';
import { getStockStatusInfo, isAlertStatus } from '../utils/stock';

// Linha compacta de produto. Produtos em alerta ganham cor, ícone e texto.
export default function ProductRow({ product, onPress }) {
  const info = getStockStatusInfo(product.stock_status);
  const hasAlert = isAlertStatus(product.stock_status);
  const quantityText = formatQuantity(product.quantity, product.unit);

  return (
    <List.Item
      title={product.name}
      titleStyle={hasAlert ? { color: info.color } : undefined}
      description={hasAlert ? `${quantityText} · ${info.label}` : quantityText}
      left={(props) => <List.Icon {...props} icon={product.category_icon} />}
      right={() =>
        hasAlert ? <List.Icon icon={info.icon} color={info.color} /> : null
      }
      onPress={onPress}
      style={styles.row}
      accessibilityLabel={`${product.name}, ${quantityText}, ${info.label}`}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 2,
  },
});