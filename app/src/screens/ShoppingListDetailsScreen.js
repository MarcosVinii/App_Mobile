import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, IconButton, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import ShoppingItemRow from '../components/ShoppingItemRow';
import StatusView from '../components/StatusView';
import * as shoppingItemService from '../services/shoppingItemService';
import * as shoppingListService from '../services/shoppingListService';
import { buildListRows, buildProgressText } from '../utils/shoppingLayout';

export default function ShoppingListDetailsScreen({ route, navigation }) {
  const isSmart = Boolean(route.params?.smart);
  const listId = route.params?.listId;
  const theme = useTheme();

  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setError('');

    try {
      // A lista inteligente atualiza as sugestões toda vez que é aberta
      const data = isSmart
        ? await shoppingListService.syncSmartList()
        : await shoppingListService.getListDetail(listId);

      setDetail({ list: data.list, sections: data.sections, items: data.items });
      navigation.setOptions({
        title: data.list.title,
        headerRight: isSmart
          ? undefined
          : () => (
              <IconButton
                icon="pencil-outline"
                onPress={() => navigation.navigate('ShoppingListForm', { listId })}
                accessibilityLabel="Renomear lista"
              />
            ),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isSmart, listId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleRetry() {
    setIsLoading(true);
    loadData();
  }

  async function handleToggleItem(item) {
    const nextStatus = item.status === 'purchased' ? 'pending' : 'purchased';

    setUpdatingItemId(item.id);
    try {
      const updated = await shoppingItemService.changeItemStatus(item.id, nextStatus);

      setDetail((current) => ({
        ...current,
        items: current.items.map((existing) =>
          existing.id === updated.id ? updated : existing
        ),
      }));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  const rows = useMemo(
    () => (detail ? buildListRows(detail.sections, detail.items) : []),
    [detail]
  );
  const progressText = detail ? buildProgressText(detail.items) : '';

  function renderRow({ item: row }) {
    if (row.type === 'section') {
      return <List.Subheader>{row.section.title}</List.Subheader>;
    }

    if (row.type === 'divider') {
      return <Divider bold style={styles.divider} />;
    }

    return (
      <ShoppingItemRow
        item={row.item}
        disabled={updatingItemId === row.item.id}
        onToggle={() => handleToggleItem(row.item)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={handleRetry}>
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          ListHeaderComponent={
            progressText ? (
              <Text
                variant="bodyMedium"
                style={[styles.progress, { color: theme.colors.onSurfaceVariant }]}
              >
                {progressText}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.empty}>
              {isSmart
                ? 'Nenhuma sugestão no momento. Quando um produto ficar com estoque baixo ou zerado, ele aparece aqui.'
                : 'Esta lista ainda não tem itens.'}
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      </StatusView>

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
    paddingBottom: 48,
  },
  progress: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  divider: {
    marginVertical: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});