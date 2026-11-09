import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  List,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import OptionChips from '../components/OptionChips';
import StatusView from '../components/StatusView';
import useToast from '../hooks/useToast';
import * as categoryService from '../services/categoryService';
import * as productService from '../services/productService';
import * as roomService from '../services/roomService';
import * as warehouseService from '../services/warehouseService';
import { formatNumber, parseDecimal } from '../utils/numbers';
import { validateProductForm } from '../utils/productValidators';
import { normalizeText } from '../utils/text';
import { DEFAULT_UNIT, UNITS, formatQuantity } from '../utils/units';

const NEW_ROOM = 'new-room';
const MAX_PRODUCTS_SHOWN = 12;
const unitOptions = UNITS.map((unit) => ({ value: unit.code, label: unit.label }));

export default function WarehouseOrganizeScreen({ route, navigation }) {
  const { itemId } = route.params;
  const theme = useTheme();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [mode, setMode] = useState('existing');
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [minQuantity, setMinQuantity] = useState('0');
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [roomId, setRoomId] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [pending, loadedProducts, loadedRooms, loadedCategories] = await Promise.all([
        warehouseService.getPending(),
        productService.listProducts(),
        roomService.listRooms(),
        categoryService.listCategories(),
      ]);

      const found = pending.items.find((entry) => entry.id === itemId);

      if (!found) {
        throw new Error('Este item não está mais no Armazém.');
      }

      setItem(found);
      setProducts(loadedProducts);
      setRooms(loadedRooms);
      setCategories(loadedCategories);

      setName(found.name);
      setQuantity(formatNumber(found.quantity));
      setUnit(found.unit);
      setRoomId(loadedRooms[0]?.id ?? NEW_ROOM);
      setCategoryId(loadedCategories[0]?.id ?? null);
      setMode(loadedProducts.length > 0 ? 'existing' : 'new');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Produtos sugeridos primeiro, depois os demais que combinam com a busca
  const visibleProducts = useMemo(() => {
    if (!item) return [];

    const term = normalizeText(search);
    const candidateIds = new Set(item.candidates.map((candidate) => candidate.id));

    return products
      .filter((product) => term === '' || normalizeText(product.name).includes(term))
      .sort((a, b) => Number(candidateIds.has(b.id)) - Number(candidateIds.has(a.id)))
      .slice(0, MAX_PRODUCTS_SHOWN);
  }, [item, products, search]);

  async function handleLinkExisting() {
    if (!selectedProductId) {
      setSubmitError('Escolha um produto da lista.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const result = await warehouseService.organizeWithProduct(itemId, selectedProductId);

      showToast(
        `Estoque atualizado: ${result.product.name} agora tem ${formatQuantity(
          result.product.quantity,
          result.product.unit
        )}.`,
        { type: 'success' }
      );
      navigation.goBack();
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  }

  async function handleCreateProduct() {
    const validationErrors = validateProductForm({
      name,
      roomId,
      categoryId,
      quantity,
      minQuantity,
    });

    if (roomId === NEW_ROOM && newRoomName.trim().length < 2) {
      validationErrors.newRoom = 'Informe o nome do novo cômodo (mínimo 2 letras).';
    }

    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      let targetRoomId = roomId;

      if (roomId === NEW_ROOM) {
        const room = await roomService.createRoom({ name: newRoomName.trim(), icon: 'door' });
        targetRoomId = room.id;
      }

      await warehouseService.organizeWithNewProduct(itemId, {
        name: name.trim(),
        room_id: targetRoomId,
        category_id: categoryId,
        quantity: parseDecimal(quantity),
        min_quantity: parseDecimal(minQuantity),
        unit,
      });

      showToast('Produto cadastrado e estoque atualizado com sucesso.', { type: 'success' });
      navigation.goBack();
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  }

  const roomOptions = [
    ...rooms.map((room) => ({ value: room.id, label: room.name, icon: room.icon })),
    { value: NEW_ROOM, label: 'Novo cômodo', icon: 'plus' },
  ];
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
  }));

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StatusView isLoading={isLoading} error={loadError} onRetry={loadData}>
        {item ? (
          <View style={styles.body}>
            <Text variant="titleLarge">{item.name}</Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Comprado: {formatQuantity(item.quantity, item.unit)}
            </Text>

            <SegmentedButtons
              value={mode}
              onValueChange={(value) => {
                setMode(value);
                setSubmitError('');
              }}
              buttons={[
                {
                  value: 'existing',
                  label: 'Produto existente',
                  icon: 'link-variant',
                  disabled: products.length === 0,
                },
                { value: 'new', label: 'Novo produto', icon: 'plus' },
              ]}
              style={styles.modes}
            />

            {mode === 'existing' ? (
              <View>
                <TextInput
                  label="Buscar produto"
                  mode="outlined"
                  value={search}
                  onChangeText={setSearch}
                />

                <View style={styles.productList}>
                  {visibleProducts.length === 0 ? (
                    <Text variant="bodyMedium" style={styles.noResult}>
                      Nenhum produto encontrado.
                    </Text>
                  ) : null}

                  {visibleProducts.map((product) => {
                    const isSelected = product.id === selectedProductId;

                    return (
                      <List.Item
                        key={product.id}
                        title={product.name}
                        description={`${product.room_name} · ${formatQuantity(
                          product.quantity,
                          product.unit
                        )}`}
                        left={(props) => <List.Icon {...props} icon={product.category_icon} />}
                        right={(props) =>
                          isSelected ? <List.Icon {...props} icon="check-circle" /> : null
                        }
                        onPress={() => setSelectedProductId(product.id)}
                        accessibilityState={{ selected: isSelected }}
                        style={isSelected ? { backgroundColor: theme.colors.secondaryContainer } : undefined}
                      />
                    );
                  })}
                </View>

                <HelperText type="error" visible={Boolean(submitError)}>
                  {submitError}
                </HelperText>

                <Button
                  mode="contained"
                  icon="plus-circle-outline"
                  onPress={handleLinkExisting}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Somar ao estoque
                </Button>
              </View>
            ) : (
              <View>
                <TextInput
                  label="Nome do produto"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  maxLength={60}
                  error={Boolean(errors.name)}
                />
                <HelperText type="error" visible={Boolean(errors.name)}>
                  {errors.name}
                </HelperText>

                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Cômodo
                </Text>
                <OptionChips options={roomOptions} value={roomId} onChange={setRoomId} />
                <HelperText type="error" visible={Boolean(errors.room)}>
                  {errors.room}
                </HelperText>

                {roomId === NEW_ROOM ? (
                  <View>
                    <TextInput
                      label="Nome do novo cômodo"
                      mode="outlined"
                      value={newRoomName}
                      onChangeText={setNewRoomName}
                      maxLength={40}
                      error={Boolean(errors.newRoom)}
                    />
                    <HelperText type="error" visible={Boolean(errors.newRoom)}>
                      {errors.newRoom}
                    </HelperText>
                  </View>
                ) : null}

                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Categoria
                </Text>
                <OptionChips
                  options={categoryOptions}
                  value={categoryId}
                  onChange={setCategoryId}
                />
                <HelperText type="error" visible={Boolean(errors.category)}>
                  {errors.category}
                </HelperText>

                <TextInput
                  label="Quantidade em estoque"
                  mode="outlined"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  error={Boolean(errors.quantity)}
                />
                <HelperText type="error" visible={Boolean(errors.quantity)}>
                  {errors.quantity}
                </HelperText>

                <TextInput
                  label="Quantidade mínima"
                  mode="outlined"
                  value={minQuantity}
                  onChangeText={setMinQuantity}
                  keyboardType="decimal-pad"
                  error={Boolean(errors.minQuantity)}
                />
                <HelperText type="error" visible={Boolean(errors.minQuantity)}>
                  {errors.minQuantity}
                </HelperText>

                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Unidade de medida
                </Text>
                <OptionChips options={unitOptions} value={unit} onChange={setUnit} />

                <HelperText type="error" visible={Boolean(submitError)}>
                  {submitError}
                </HelperText>

                <Button
                  mode="contained"
                  icon="check"
                  onPress={handleCreateProduct}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Cadastrar e somar ao estoque
                </Button>
              </View>
            )}
          </View>
        ) : null}
      </StatusView>
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
  },
  subtitle: {
    marginBottom: 16,
  },
  modes: {
    marginBottom: 16,
  },
  productList: {
    marginTop: 8,
  },
  noResult: {
    textAlign: 'center',
    marginVertical: 16,
  },
  sectionTitle: {
    marginTop: 4,
    marginBottom: 8,
  },
});