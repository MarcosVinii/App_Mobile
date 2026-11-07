import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import ConfirmDialog from '../components/ConfirmDialog';
import RoomCard from '../components/RoomCard';
import StatusView from '../components/StatusView';
import useRooms from '../hooks/useRooms';
import * as roomService from '../services/roomService';

export default function RoomsScreen({ navigation }) {
  const theme = useTheme();
  const { rooms, isLoading, error, reload } = useRooms();

  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');

  // Recarrega a lista sempre que a tela volta a ficar em foco
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await roomService.deleteRoom(roomToDelete.id);
      setRoomToDelete(null);
      await reload();
    } catch (err) {
      setRoomToDelete(null);
      setMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={() => reload(true)}>
        <FlatList
          data={rooms}
          keyExtractor={(room) => String(room.id)}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onPress={() => navigation.navigate('RoomDetails', { roomId: item.id })}
              onEdit={() => navigation.navigate('RoomForm', { roomId: item.id })}
              onDelete={() => setRoomToDelete(item)}
            />
          )}
          ListHeaderComponent={
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('RoomForm')}
              style={styles.addButton}
            >
              Adicionar cômodo
            </Button>
          }
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.empty}>
              Você ainda não tem cômodos. Toque em "Adicionar cômodo" para começar.
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      </StatusView>

      <ConfirmDialog
        visible={Boolean(roomToDelete)}
        title="Excluir cômodo"
        message={`Excluir "${roomToDelete?.name}"? Todos os produtos deste cômodo também serão excluídos. Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setRoomToDelete(null)}
      />

      <Snackbar visible={Boolean(message)} onDismiss={() => setMessage('')}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  addButton: {
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});