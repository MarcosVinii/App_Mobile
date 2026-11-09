import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Snackbar, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import ConfirmDialog from '../components/ConfirmDialog';
import ShoppingListCard from '../components/ShoppingListCard';
import StatusView from '../components/StatusView';
import * as shoppingListService from '../services/shoppingListService';

export default function ShoppingScreen({ navigation }) {
  const theme = useTheme();

  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [listToDelete, setListToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const loadLists = useCallback(async () => {
    setError('');

    try {
      setLists(await shoppingListService.listLists());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists])
  );

  function handleRetry() {
    setIsLoading(true);
    loadLists();
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await shoppingListService.deleteList(listToDelete.id);
      setListToDelete(null);
      await loadLists();
    } catch (err) {
      setListToDelete(null);
      setMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={handleRetry}>
        <FlatList
          data={lists}
          keyExtractor={(list) => String(list.id)}
          renderItem={({ item }) => (
            <ShoppingListCard
              list={item}
              onPress={() => navigation.navigate('ShoppingListDetails', { listId: item.id })}
              onEdit={() => navigation.navigate('ShoppingListForm', { listId: item.id })}
              onDelete={() => setListToDelete(item)}
            />
          )}
          ListHeaderComponent={
            <View>
              <Card
                style={styles.smartCard}
                onPress={() => navigation.navigate('ShoppingListDetails', { smart: true })}
                accessibilityLabel="Abrir lista inteligente"
              >
                <Card.Title
                  title="Lista inteligente"
                  titleVariant="titleMedium"
                  subtitle="Sugestões de reposição com base no seu estoque"
                  subtitleNumberOfLines={2}
                  left={(props) => <Avatar.Icon {...props} icon="lightbulb-on-outline" />}
                />
              </Card>

              <View style={styles.listsHeader}>
                <Text variant="titleMedium">Minhas listas</Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => navigation.navigate('ShoppingListForm')}
                >
                  Nova lista
                </Button>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.empty}>
              Você ainda não criou nenhuma lista. Toque em "Nova lista" para começar.
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      </StatusView>

      <ConfirmDialog
        visible={Boolean(listToDelete)}
        title="Excluir lista"
        message={`Excluir "${listToDelete?.title}"? Todos os itens da lista também serão excluídos. Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setListToDelete(null)}
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
  smartCard: {
    marginBottom: 24,
  },
  listsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});