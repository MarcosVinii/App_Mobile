import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, IconButton, Snackbar, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import AddToListDialog from '../components/AddToListDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import EntityAvatar from '../components/EntityAvatar';
import StatusView from '../components/StatusView';
import StockStatusBadge from '../components/StockStatusBadge';
import * as productService from '../services/productService';
import useToast from '../hooks/useToast';
import { formatNumber } from '../utils/numbers';
import { isAlertStatus } from '../utils/stock';
import { formatQuantity, getQuantityStep, getUnitShort } from '../utils/units';

function InfoRow({ label, value }) {
  const theme = useTheme();

  return (
    <View style={styles.infoRow}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyLarge">{value}</Text>
    </View>
  );
}

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const theme = useTheme();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddToList, setShowAddToList] = useState(false);
  const { showToast } = useToast();

  const loadProduct = useCallback(async () => {
    setError('');

    try {
      const loadedProduct = await productService.getProduct(productId);
      setProduct(loadedProduct);
      navigation.setOptions({ title: loadedProduct.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadProduct();
    }, [loadProduct])
  );

  function handleRetry() {
    setIsLoading(true);
    loadProduct();
  }

  // direction: 1 para adicionar, -1 para diminuir (nunca abaixo de zero)
  async function handleChangeQuantity(direction) {
    const step = getQuantityStep(product.unit);
    const delta = direction > 0 ? step : -Math.min(step, product.quantity);

    setIsUpdating(true);
    try {
      setProduct(await productService.changeQuantity(product.id, delta));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      setShowDeleteDialog(false);
      navigation.goBack();
    } catch (err) {
      setShowDeleteDialog(false);
      setMessage(err.message);
      setIsDeleting(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
    >
      <StatusView isLoading={isLoading} error={error} onRetry={handleRetry}>
        {product ? (
          <View style={styles.body}>
            <EntityAvatar image={product.image} icon={product.category_icon} size={72} style={styles.avatar} />
            <Text variant="headlineSmall" style={styles.name}>
              {product.name}
            </Text>
            <StockStatusBadge status={product.stock_status} />

            <View style={styles.quantityBox}>
              <IconButton
                icon="minus"
                mode="contained-tonal"
                size={28}
                onPress={() => handleChangeQuantity(-1)}
                disabled={isUpdating || product.quantity <= 0}
                accessibilityLabel="Diminuir quantidade"
              />
              <View style={styles.quantityValue}>
                <Text variant="displaySmall">{formatNumber(product.quantity)}</Text>
                <Text variant="titleMedium">{getUnitShort(product.unit)}</Text>
              </View>
              <IconButton
                icon="plus"
                mode="contained-tonal"
                size={28}
                onPress={() => handleChangeQuantity(1)}
                disabled={isUpdating}
                accessibilityLabel="Aumentar quantidade"
              />
            </View>
            <Text
              variant="bodySmall"
              style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
            >
              Cada toque altera {formatQuantity(getQuantityStep(product.unit), product.unit)}.
            </Text>

            <Button
              mode={isAlertStatus(product.stock_status) ? 'contained' : 'outlined'}
              icon="cart-plus"
              onPress={() => setShowAddToList(true)}
              style={styles.action}
            >
              Adicionar à lista de compras
            </Button>

            <View style={styles.info}>
              <InfoRow label="Cômodo" value={product.room_name} />
              <InfoRow label="Categoria" value={product.category_name} />
              <InfoRow
                label="Quantidade mínima"
                value={formatQuantity(product.min_quantity, product.unit)}
              />
              {product.description ? (
                <InfoRow label="Descrição" value={product.description} />
              ) : null}
            </View>

            <Button
              mode="contained"
              icon="pencil-outline"
              onPress={() => navigation.navigate('ProductForm', { productId: product.id })}
              style={styles.action}
            >
              Editar produto
            </Button>
            <Button
              mode="outlined"
              icon="trash-can-outline"
              onPress={() => setShowDeleteDialog(true)}
              style={styles.action}
            >
              Excluir produto
            </Button>
          </View>
        ) : null}
      </StatusView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Excluir produto"
        message={`Excluir "${product?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setShowDeleteDialog(false)}
      />

      <AddToListDialog
        visible={showAddToList}
        product={product}
        onDismiss={() => setShowAddToList(false)}
        onAdded={(list) => {
          setShowAddToList(false);
          showToast(`${product.name} adicionado à lista "${list.title}".`, { type: 'success' });
        }}
      />

      <Snackbar visible={Boolean(message)} onDismiss={() => setMessage('')}>
        {message}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 24,
  },
  body: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
  },
  avatar: {
    marginTop: 8,
    marginBottom: 12,
  },
  name: {
    marginBottom: 8,
    textAlign: 'center',
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  quantityValue: {
    alignItems: 'center',
    minWidth: 96,
  },
  hint: {
    marginTop: 4,
    marginBottom: 24,
  },
  info: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    gap: 2,
  },
  action: {
    width: '100%',
    marginBottom: 12,
  },
});