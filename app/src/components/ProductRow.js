import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

import { formatQuantity } from '../utils/units';
import { getStockStatusInfo, isAlertStatus } from '../utils/stock';
import EntityAvatar from './EntityAvatar';

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
      left={(props) =>
        product.image ? (
          <View style={[props.style, styles.thumb]}>
            <EntityAvatar size={40} image={product.image} icon={product.category_icon} />
          </View>
        ) : (
          <List.Icon {...props} icon={product.category_icon} />
        )
      }
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
  thumb: {
    justifyContent: 'center',
  },
});