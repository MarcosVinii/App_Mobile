import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import StatusView from '../components/StatusView';
import * as roomService from '../services/roomService';

export default function RoomDetailsScreen({ route, navigation }) {
  const { roomId } = route.params;
  const theme = useTheme();

  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRoom = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const loadedRoom = await roomService.getRoom(roomId);
      setRoom(loadedRoom);
      navigation.setOptions({ title: loadedRoom.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadRoom();
    }, [loadRoom])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={loadRoom}>
        {room ? (
          <>
            <Avatar.Icon icon={room.icon} size={72} style={styles.avatar} />
            <Text variant="headlineSmall" style={styles.name}>
              {room.name}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
            >
              Os produtos deste cômodo aparecerão aqui.
            </Text>
            <Button
              mode="outlined"
              icon="pencil-outline"
              onPress={() => navigation.navigate('RoomForm', { roomId: room.id })}
            >
              Editar cômodo
            </Button>
          </>
        ) : null}
      </StatusView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginTop: 16,
    marginBottom: 12,
  },
  name: {
    marginBottom: 8,
  },
  hint: {
    marginBottom: 24,
    textAlign: 'center',
  },
});