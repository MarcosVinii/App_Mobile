import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import ShoppingItemRow from '../components/ShoppingItemRow';
import SmartOrganizationButton from '../components/SmartOrganizationButton';
import StatusView from '../components/StatusView';
import usePreferences from '../hooks/usePreferences';
import useToast from '../hooks/useToast';
import * as shoppingItemService from '../services/shoppingItemService';
import * as shoppingListService from '../services/shoppingListService';
import { getPurchaseFeedback } from '../utils/purchaseMessages';
import { buildListRows, buildProgressText } from '../utils/shoppingLayout';

export default function ShoppingListDetailsScreen({ route, navigation }) {
  const isSmart = Boolean(route.params?.smart);
  const listId = route.params?.listId;
  const theme = useTheme();
  const { smartOrganization } = usePreferences();
  const { showToast } = useToast();

  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);

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
        headerRight: () => (
          <View style={styles.headerActions}>
            <SmartOrganizationButton />
            {isSmart ? null : (
              <IconButton
                icon="pencil-outline"
                onPress={() => navigation.navigate('ShoppingListForm', { listId })}
                accessibilityLabel="Editar lista"
              />
            )}
          </View>
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
      const result = await shoppingItemService.changeItemStatus(
        item.id,
        nextStatus,
        smartOrganization
      );

      const nextItems = detail.items.map((existing) =>
        existing.id === result.item.id ? result.item : existing
      );
      setDetail({ ...detail, items: nextItems });

      const feedback = getPurchaseFeedback(result.outcome);
      if (feedback) {
        showToast(feedback.message, { type: feedback.type });
      }

      const isCompleted =
        !isSmart && nextItems.length > 0 && nextItems.every((entry) => entry.status === 'purchased');
      if (isCompleted) {
        showToast('Lista concluída! Ela agora aparece em "Listas concluídas".', {
          type: 'success',
        });
      }
    } catch (err) {
      showToast(err.message, { type: 'error' });
    } finally {
      setUpdatingItemId(null);
    }
  }

  const rows = useMemo(
    () => (detail ? buildListRows(detail.sections, detail.items) : []),
    [detail]
  );
  const progressText = detail ? buildProgressText(detail.items) : '';
  const notes = detail?.list.notes;

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
            <View>
              {notes ? (
                <Card style={styles.notes}>
                  <Card.Content>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Observações
                    </Text>
                    <Text variant="bodyMedium">{notes}</Text>
                  </Card.Content>
                </Card>
              ) : null}
              {progressText ? (
                <Text
                  variant="bodyMedium"
                  style={[styles.progress, { color: theme.colors.onSurfaceVariant }]}
                >
                  {progressText}
                </Text>
              ) : null}
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 48,
  },
  notes: {
    marginBottom: 12,
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