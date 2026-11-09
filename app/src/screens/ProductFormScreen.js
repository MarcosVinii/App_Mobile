import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

import FoodSearchPanel from '../components/FoodSearchPanel';
import OptionChips from '../components/OptionChips';
import StatusView from '../components/StatusView';
import useToast from '../hooks/useToast';
import * as categoryService from '../services/categoryService';
import * as productService from '../services/productService';
import * as roomService from '../services/roomService';
import { formatNumber, parseDecimal } from '../utils/numbers';
import { validateProductForm } from '../utils/productValidators';
import { DEFAULT_UNIT, UNITS } from '../utils/units';

const unitOptions = UNITS.map((unit) => ({ value: unit.code, label: unit.label }));

export default function ProductFormScreen({ route, navigation }) {
  const productId = route.params?.productId;
  const isEditing = Boolean(productId);
  const theme = useTheme();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [roomId, setRoomId] = useState(route.params?.roomId ?? null);
  const [categoryId, setCategoryId] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [minQuantity, setMinQuantity] = useState('0');
  const [unit, setUnit] = useState(DEFAULT_UNIT);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Carrega cômodos e categorias (e o produto, no modo edição)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [loadedRooms, loadedCategories, product] = await Promise.all([
        roomService.listRooms(),
        categoryService.listCategories(),
        isEditing ? productService.getProduct(productId) : Promise.resolve(null),
      ]);

      setRooms(loadedRooms);
      setCategories(loadedCategories);

      if (product) {
        setName(product.name);
        setDescription(product.description || '');
        setRoomId(product.room_id);
        setCategoryId(product.category_id);
        setQuantity(formatNumber(product.quantity));
        setMinQuantity(formatNumber(product.min_quantity));
        setUnit(product.unit);
      } else {
        setCategoryId(loadedCategories[0]?.id ?? null);
      }
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Preenche nome, descrição e categoria com o alimento escolhido no Open Food Facts
  function handleFoodSelected(food) {
    setName(food.name);
    setDescription(food.description);

    const foodCategory = categories.find((category) => category.name === 'Alimentos');
    if (foodCategory) {
      setCategoryId(foodCategory.id);
    }

    setErrors({});
    showToast(`Dados de "${food.name}" preenchidos. Revise e salve.`, { type: 'success' });
  }

  async function handleSave() {
    const validationErrors = validateProductForm({
      name,
      roomId,
      categoryId,
      quantity,
      minQuantity,
    });
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      room_id: roomId,
      category_id: categoryId,
      quantity: parseDecimal(quantity),
      min_quantity: parseDecimal(minQuantity),
      unit,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await productService.updateProduct(productId, payload);
      } else {
        await productService.createProduct(payload);
      }

      navigation.goBack();
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  }

  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: room.name,
    icon: room.icon,
  }));
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
        <View style={styles.form}>
          {!isEditing ? <FoodSearchPanel onSelect={handleFoodSelected} /> : null}

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

          <TextInput
            label="Descrição (opcional)"
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
          />

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
            label="Quantidade atual"
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
          <HelperText type={errors.minQuantity ? 'error' : 'info'} visible>
            {errors.minQuantity ||
              'Avisamos que o estoque está baixo quando chegar nesse valor ou menos.'}
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
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          >
            {isEditing ? 'Salvar alterações' : 'Adicionar produto'}
          </Button>
        </View>
      </StatusView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 24,
  },
  form: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  sectionTitle: {
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});