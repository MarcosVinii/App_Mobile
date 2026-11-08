import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import ProductRow from '../components/ProductRow';
import StatusView from '../components/StatusView';
import * as productService from '../services/productService';
import * as roomService from '../services/roomService';

function buildSummary(products) {
  if (products.length === 0) return '';

  const lowCount = products.filter((p) => p.stock_status === 'low_stock').length;
  const outCount = products.filter((p) => p.stock_status === 'out_of_stock').length;

  const parts = [`${products.length} ${products.length === 1 ? 'produto' : 'produtos'}`];
  if (lowCount > 0) parts.push(`${lowCount} com estoque baixo`);
  if (outCount > 0) parts.push(`${outCount} sem estoque`);

  return parts.join(' · ');
}

export default function RoomDetailsScreen({ route, navigation }) {
  const { roomId } = route.params;
  const theme = useTheme();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setError('');

    try {
      const [room, roomProducts] = await Promise.all([
        roomService.getRoom(roomId),
        productService.listProducts(roomId),
      ]);

      setProducts(roomProducts);
      navigation.setOptions({
        title: room.name,
        headerRight: () => (
          <IconButton
            icon="pencil-outline"
            onPress={() => navigation.navigate('RoomForm', { roomId })}
            accessibilityLabel="Editar cômodo"
          />
        ),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleRetry() {
    setIsLoading(true);
    loadData();
  }

  const summary = buildSummary(products);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={handleRetry}>
        <FlatList
          data={products}
          keyExtractor={(product) => String(product.id)}
          renderItem={({ item }) => (
            <ProductRow
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
          ItemSeparatorComponent={Divider}
          ListHeaderComponent={
            <View style={styles.header}>
              {summary ? (
                <Text
                  variant="bodyMedium"
                  style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}
                >
                  {summary}
                </Text>
              ) : null}
              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate('ProductForm', { roomId })}
              >
                Adicionar produto
              </Button>
            </View>
          }
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.empty}>
              Este cômodo ainda não tem produtos. Toque em "Adicionar produto" para começar.
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
  list: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 12,
  },
  summary: {
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});