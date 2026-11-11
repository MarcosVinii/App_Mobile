import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  HelperText,
  List,
  Portal,
  Text,
} from 'react-native-paper';

import * as shoppingItemService from '../services/shoppingItemService';
import * as shoppingListService from '../services/shoppingListService';
import { suggestRestockQuantity } from '../utils/restock';
import { formatQuantity } from '../utils/units';

// Escolhe em qual lista de compras colocar um produto (com a quantidade sugerida)
export default function AddToListDialog({ visible, product, onDismiss, onAdded }) {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return undefined;

    let isActive = true;
    setIsLoading(true);
    setError('');

    shoppingListService
      .listLists()
      .then((data) => {
        if (isActive) setLists(data);
      })
      .catch((err) => {
        if (isActive) setError(err.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [visible]);

  if (!product) return null;

  const quantity = suggestRestockQuantity(product);

  async function handlePick(list) {
    setWorkingId(list.id);
    setError('');

    try {
      await shoppingItemService.createItem({
        list_id: list.id,
        product_id: product.id,
        quantity,
        unit: product.unit,
      });
      onAdded(list, quantity);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Adicionar à lista</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {`${product.name} (${formatQuantity(quantity, product.unit)}) vai para qual lista?`}
          </Text>
        </Dialog.Content>

        <Dialog.ScrollArea style={styles.scrollArea}>
          {isLoading ? <ActivityIndicator style={styles.loading} /> : null}

          {!isLoading && lists.length === 0 && !error ? (
            <Text variant="bodyMedium" style={styles.empty}>
              Você ainda não tem listas. Crie uma na aba Compras. Produtos com estoque baixo
              também aparecem sozinhos na Lista inteligente.
            </Text>
          ) : null}

          {lists.map((list) => (
            <List.Item
              key={list.id}
              title={list.title}
              description={`${list.pending_items} pendentes`}
              left={(props) => <List.Icon {...props} icon="format-list-checkbox" />}
              onPress={() => handlePick(list)}
              disabled={workingId !== null}
            />
          ))}
        </Dialog.ScrollArea>

        <HelperText type="error" visible={Boolean(error)} style={styles.error}>
          {error}
        </HelperText>

        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancelar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 280,
  },
  loading: {
    marginVertical: 16,
  },
  empty: {
    paddingVertical: 16,
  },
  error: {
    paddingHorizontal: 24,
  },
});