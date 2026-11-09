import { StyleSheet } from 'react-native';
import { Avatar, Card, IconButton } from 'react-native-paper';

import { isListCompleted } from '../utils/listStatus';

function buildSubtitle(list) {
  if (list.total_items === 0) return 'Lista vazia';

  const itemsLabel = list.total_items === 1 ? 'item' : 'itens';

  if (isListCompleted(list)) {
    return `Concluída · ${list.total_items} ${itemsLabel}`;
  }

  const pendingLabel = list.pending_items === 1 ? 'pendente' : 'pendentes';

  return `${list.total_items} ${itemsLabel} · ${list.pending_items} ${pendingLabel}`;
}

export default function ShoppingListCard({ list, onPress, onEdit, onDelete }) {
  const icon = isListCompleted(list) ? 'check-circle-outline' : 'format-list-checkbox';

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`Abrir lista ${list.title}`}
    >
      <Card.Title
        title={list.title}
        titleVariant="titleMedium"
        subtitle={buildSubtitle(list)}
        left={(props) => <Avatar.Icon {...props} icon={icon} />}
        right={() => (
          <>
            <IconButton
              icon="pencil-outline"
              onPress={onEdit}
              accessibilityLabel={`Editar ${list.title}`}
            />
            <IconButton
              icon="trash-can-outline"
              onPress={onDelete}
              accessibilityLabel={`Excluir ${list.title}`}
            />
          </>
        )}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});