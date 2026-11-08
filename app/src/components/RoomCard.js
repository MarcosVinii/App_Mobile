import { StyleSheet } from 'react-native';
import { Avatar, Card, IconButton } from 'react-native-paper';

import RoomStockSummary from './RoomStockSummary';

export default function RoomCard({ room, onPress, onEdit, onDelete }) {
  return (
    <Card
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`Abrir cômodo ${room.name}`}
    >
      <Card.Title
        title={room.name}
        titleVariant="titleMedium"
        left={(props) => <Avatar.Icon {...props} icon={room.icon} />}
        right={() => (
          <>
            <IconButton
              icon="pencil-outline"
              onPress={onEdit}
              accessibilityLabel={`Editar ${room.name}`}
            />
            <IconButton
              icon="trash-can-outline"
              onPress={onDelete}
              accessibilityLabel={`Excluir ${room.name}`}
            />
          </>
        )}
      />
      <Card.Content style={styles.content}>
        <RoomStockSummary room={room} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    marginBottom: 12,
  },
});