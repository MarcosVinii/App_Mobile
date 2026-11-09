import { StyleSheet, View } from 'react-native';
import { Checkbox, List, useTheme } from 'react-native-paper';

import { formatQuantity } from '../utils/units';

// Linha de item da lista de compras. Tocar na linha marca ou desmarca como comprado.
export default function ShoppingItemRow({ item, onToggle, disabled = false }) {
  const theme = useTheme();
  const isPurchased = item.status === 'purchased';
  const quantityText = formatQuantity(item.quantity, item.unit);
  const description =
    item.origin === 'suggestion' ? `${quantityText} · sugestão do estoque` : quantityText;

  return (
    <List.Item
      title={item.name}
      titleStyle={
        isPurchased
          ? { textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant }
          : undefined
      }
      description={description}
      left={(props) => (
        <View style={[props.style, styles.checkbox]}>
          <Checkbox status={isPurchased ? 'checked' : 'unchecked'} disabled={disabled} />
        </View>
      )}
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isPurchased, disabled }}
      accessibilityLabel={`${item.name}, ${quantityText}${isPurchased ? ', comprado' : ''}`}
    />
  );
}

const styles = StyleSheet.create({
  checkbox: {
    justifyContent: 'center',
  },
});