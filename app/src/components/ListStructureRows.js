import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider, IconButton, Text, useTheme } from 'react-native-paper';

function MoveButtons({ label, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) {
  return (
    <>
      <IconButton
        icon="arrow-up"
        size={20}
        disabled={!canMoveUp}
        onPress={onMoveUp}
        accessibilityLabel={`Mover ${label} para cima`}
      />
      <IconButton
        icon="arrow-down"
        size={20}
        disabled={!canMoveDown}
        onPress={onMoveDown}
        accessibilityLabel={`Mover ${label} para baixo`}
      />
    </>
  );
}

// Linha de seção no modo "Organizar"
export function SectionHeaderRow({ title, onRename, onDelete, ...moveProps }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.colors.surfaceVariant }]}>
      <MaterialCommunityIcons name="folder-outline" size={20} color={theme.colors.onSurfaceVariant} />
      <Text variant="titleSmall" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <MoveButtons label={`a seção ${title}`} {...moveProps} />
      <IconButton
        icon="pencil-outline"
        size={20}
        onPress={onRename}
        accessibilityLabel={`Renomear a seção ${title}`}
      />
      <IconButton
        icon="trash-can-outline"
        size={20}
        onPress={onDelete}
        accessibilityLabel={`Excluir a seção ${title}`}
      />
    </View>
  );
}

// Linha de divisor no modo "Organizar"
export function DividerRow({ onDelete, ...moveProps }) {
  return (
    <View style={styles.row}>
      <Divider bold style={styles.divider} />
      <MoveButtons label="o divisor" {...moveProps} />
      <IconButton
        icon="trash-can-outline"
        size={20}
        onPress={onDelete}
        accessibilityLabel="Excluir o divisor"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
  },
  divider: {
    flex: 1,
  },
});