import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

import { getStockStatusInfo } from '../utils/stock';

export default function StockStatusBadge({ status }) {
  const info = getStockStatusInfo(status);

  return (
    <View style={styles.row} accessibilityLabel={info.label}>
      <MaterialCommunityIcons name={info.icon} size={20} color={info.color} />
      <Text variant="labelLarge" style={{ color: info.color }}>
        {info.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});