import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, IconButton, List, Text, useTheme } from 'react-native-paper';

import { formatQuantity } from '../utils/units';

// Linha de item da lista de compras.
// mode "check": tocar na linha marca como comprado; tocar na quantidade edita.
// mode "organize": tocar na linha edita; setas reordenam.
export default function ShoppingItemRow({
  item,
  mode = 'check',
  disabled = false,
  canMoveUp = false,
  canMoveDown = false,
  onToggle,
  onEdit,
  onMoveUp,
  onMoveDown,
}) {
  const theme = useTheme();
  const isOrganizing = mode === 'organize';
  const isPurchased = item.status === 'purchased';
  const quantityText = formatQuantity(item.quantity, item.unit);

  return (
    <List.Item
      title={item.name}
      titleStyle={
        isPurchased && !isOrganizing
          ? { textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant }
          : undefined
      }
      description={item.origin === 'suggestion' ? 'Sugestão do estoque' : undefined}
      left={(props) =>
        isOrganizing ? (
          <List.Icon {...props} icon="pencil-outline" />
        ) : (
          <View style={[props.style, styles.checkbox]}>
            <Checkbox status={isPurchased ? 'checked' : 'unchecked'} disabled={disabled} />
          </View>
        )
      }
      right={() =>
        isOrganizing ? (
          <View style={styles.organizeActions}>
            <Text variant="labelLarge">{quantityText}</Text>
            <IconButton
              icon="arrow-up"
              size={20}
              disabled={!canMoveUp}
              onPress={onMoveUp}
              accessibilityLabel={`Mover ${item.name} para cima`}
            />
            <IconButton
              icon="arrow-down"
              size={20}
              disabled={!canMoveDown}
              onPress={onMoveDown}
              accessibilityLabel={`Mover ${item.name} para baixo`}
            />
          </View>
        ) : (
          <Button
            compact
            mode="text"
            onPress={onEdit}
            accessibilityLabel={`Editar ${item.name}. Quantidade: ${quantityText}`}
          >
            {quantityText}
          </Button>
        )
      }
      onPress={isOrganizing ? onEdit : onToggle}
      disabled={disabled}
      accessibilityRole={isOrganizing ? 'button' : 'checkbox'}
      accessibilityState={isOrganizing ? { disabled } : { checked: isPurchased, disabled }}
      accessibilityLabel={`${item.name}, ${quantityText}${isPurchased ? ', comprado' : ''}`}
    />
  );
}

const styles = StyleSheet.create({
  checkbox: {
    justifyContent: 'center',
  },
  organizeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});