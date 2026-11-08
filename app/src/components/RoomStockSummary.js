import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';

import { getStockStatusInfo } from '../utils/stock';

function StatusCount({ status, count, text, accessibilityLabel }) {
  const theme = useTheme();
  const info = getStockStatusInfo(status);
  const color = count > 0 ? info.color : theme.colors.onSurfaceVariant;

  return (
    <View style={styles.item} accessible accessibilityLabel={accessibilityLabel}>
      <MaterialCommunityIcons name={info.icon} size={16} color={color} />
      <Text variant="labelMedium" style={{ color }}>
        {text}
      </Text>
    </View>
  );
}

// Resumo do estoque de um cômodo: total e quantidade por situação
export default function RoomStockSummary({ room }) {
  const theme = useTheme();

  if (room.total_products === 0) {
    return (
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Nenhum produto cadastrado
      </Text>
    );
  }

  const total = room.total_products;
  const normal = room.normal_products;
  const low = room.low_stock_products;
  const out = room.out_of_stock_products;

  return (
    <View style={styles.wrap}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {total} {total === 1 ? 'produto' : 'produtos'}
      </Text>
      <StatusCount
        status="normal"
        count={normal}
        text={`${normal} ${normal === 1 ? 'normal' : 'normais'}`}
        accessibilityLabel={`Estoque normal: ${normal}`}
      />
      <StatusCount
        status="low_stock"
        count={low}
        text={`${low} baixo`}
        accessibilityLabel={`Estoque baixo: ${low}`}
      />
      <StatusCount
        status="out_of_stock"
        count={out}
        text={`${out} sem estoque`}
        accessibilityLabel={`Sem estoque: ${out}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 14,
    rowGap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});