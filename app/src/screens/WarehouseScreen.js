import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import ConfirmDialog from '../components/ConfirmDialog';
import StatusView from '../components/StatusView';
import WarehouseItemCard from '../components/WarehouseItemCard';
import useToast from '../hooks/useToast';
import * as warehouseService from '../services/warehouseService';
import { formatQuantity } from '../utils/units';

export default function WarehouseScreen({ navigation }) {
  const theme = useTheme();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkRequest, setLinkRequest] = useState(null);
  const [itemToDiscard, setItemToDiscard] = useState(null);
  const [isWorking, setIsWorking] = useState(false);

  const loadItems = useCallback(async () => {
    setError('');

    try {
      const data = await warehouseService.getPending();
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  function handleRetry() {
    setIsLoading(true);
    loadItems();
  }

  async function handleConfirmLink() {
    const { item, candidate } = linkRequest;

    setIsWorking(true);
    try {
      const result = await warehouseService.organizeWithProduct(item.id, candidate.id);

      showToast(
        `Estoque atualizado: ${result.product.name} agora tem ${formatQuantity(
          result.product.quantity,
          result.product.unit
        )}.`,
        { type: 'success' }
      );
      setLinkRequest(null);
      await loadItems();
    } catch (err) {
      setLinkRequest(null);
      showToast(err.message, { type: 'error' });
    } finally {
      setIsWorking(false);
    }
  }

  async function handleConfirmDiscard() {
    setIsWorking(true);
    try {
      await warehouseService.discardItem(itemToDiscard.id);
      showToast('Item removido do Armazém.', { type: 'info' });
      setItemToDiscard(null);
      await loadItems();
    } catch (err) {
      setItemToDiscard(null);
      showToast(err.message, { type: 'error' });
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={handleRetry}>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <WarehouseItemCard
              item={item}
              onOrganize={() => navigation.navigate('WarehouseOrganize', { itemId: item.id })}
              onLinkCandidate={(candidate) => setLinkRequest({ item, candidate })}
              onDiscard={() => setItemToDiscard(item)}
            />
          )}
          ListHeaderComponent={
            items.length > 0 ? (
              <Text
                variant="bodyMedium"
                style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}
              >
                Itens comprados que ainda não entraram no estoque. Organize cada um para somar
                ao estoque ou cadastrá-lo.
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.empty}>
              Nenhum item aguardando organização. Quando você marcar compras sem a
              organização inteligente, ou de produtos novos, elas aparecem aqui.
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      </StatusView>

      <ConfirmDialog
        visible={Boolean(linkRequest)}
        title="Somar ao estoque"
        message={
          linkRequest
            ? `Somar ${formatQuantity(linkRequest.item.quantity, linkRequest.item.unit)} ao produto "${linkRequest.candidate.name}" (${linkRequest.candidate.room_name})? Estoque atual: ${formatQuantity(linkRequest.candidate.quantity, linkRequest.candidate.unit)}.`
            : ''
        }
        confirmLabel="Somar"
        isLoading={isWorking}
        onConfirm={handleConfirmLink}
        onDismiss={() => setLinkRequest(null)}
      />

      <ConfirmDialog
        visible={Boolean(itemToDiscard)}
        title="Remover do Armazém"
        message={`Remover "${itemToDiscard?.name}" do Armazém? O estoque não será alterado.`}
        confirmLabel="Remover"
        isLoading={isWorking}
        onConfirm={handleConfirmDiscard}
        onDismiss={() => setItemToDiscard(null)}
      />
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
  intro: {
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});