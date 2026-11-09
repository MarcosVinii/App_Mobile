import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';

import useToast from '../hooks/useToast';
import * as productService from '../services/productService';
import * as shoppingItemService from '../services/shoppingItemService';
import * as shoppingListService from '../services/shoppingListService';
import { parseDecimal } from '../utils/numbers';
import { normalizeText } from '../utils/text';
import { DEFAULT_UNIT, UNITS } from '../utils/units';
import OptionChips from './OptionChips';

const unitOptions = UNITS.map((unit) => ({ value: unit.code, label: unit.label }));
const COMMANDS_PLACEHOLDER = '# Alimentos\n- Arroz #2 kg\n- Leite #3 L\n---\n# Limpeza\n- Detergente #3';

function buildImportSummary(result) {
  const parts = [];

  if (result.added_items > 0) {
    parts.push(`${result.added_items} ${result.added_items === 1 ? 'item' : 'itens'}`);
  }
  if (result.added_sections > 0) {
    parts.push(`${result.added_sections} ${result.added_sections === 1 ? 'seção' : 'seções'}`);
  }
  if (result.added_dividers > 0) {
    parts.push(`${result.added_dividers} ${result.added_dividers === 1 ? 'divisor' : 'divisores'}`);
  }

  return parts.length > 0 ? `Adicionado: ${parts.join(', ')}.` : 'Nada foi adicionado.';
}

// Painel para adicionar itens: formulário visual ou comandos de texto
export default function AddItemsPanel({ listId, onChanged }) {
  const theme = useTheme();
  const { showToast } = useToast();

  const [mode, setMode] = useState('item');
  const [products, setProducts] = useState([]);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [text, setText] = useState('');
  const [skipped, setSkipped] = useState([]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Produtos do estoque, para sugerir enquanto o usuário digita
  useEffect(() => {
    productService
      .listProducts()
      .then(setProducts)
      .catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    const term = normalizeText(name);

    if (term.length < 2 || selectedProduct) return [];

    return products
      .filter((product) => normalizeText(product.name).includes(term))
      .slice(0, 4);
  }, [name, products, selectedProduct]);

  function handleNameChange(value) {
    setName(value);

    if (selectedProduct && normalizeText(value) !== normalizeText(selectedProduct.name)) {
      setSelectedProduct(null);
    }
  }

  function handlePickProduct(product) {
    setSelectedProduct(product);
    setName(product.name);
    setUnit(product.unit);
  }

  async function handleAddItem() {
    const parsedQuantity = parseDecimal(quantity);

    if (name.trim().length < 2) {
      setError('Informe o nome do item (mínimo 2 letras).');
      return;
    }
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError('Informe uma quantidade maior que zero.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await shoppingItemService.createItem({
        list_id: listId,
        name: name.trim(),
        quantity: parsedQuantity,
        unit,
        product_id: selectedProduct ? selectedProduct.id : undefined,
      });

      showToast(`${name.trim()} adicionado à lista.`, { type: 'success' });
      setName('');
      setQuantity('1');
      setUnit(DEFAULT_UNIT);
      setSelectedProduct(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImport() {
    if (!text.trim()) {
      setError('Digite os itens da lista.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const data = await shoppingListService.importCommands(listId, text);

      setSkipped(data.result.skipped);
      setText('');
      showToast(buildImportSummary(data.result), {
        type: data.result.added_items + data.result.added_sections > 0 ? 'success' : 'error',
      });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => {
            setMode(value);
            setError('');
          }}
          buttons={[
            { value: 'item', label: 'Item', icon: 'cart-plus' },
            { value: 'commands', label: 'Comandos', icon: 'text-box-outline' },
          ]}
        />

        {mode === 'item' ? (
          <View style={styles.form}>
            <TextInput
              label="Nome do item"
              mode="outlined"
              value={name}
              onChangeText={handleNameChange}
              maxLength={60}
            />

            {suggestions.length > 0 ? (
              <View style={styles.suggestions}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Do seu estoque:
                </Text>
                <View style={styles.chips}>
                  {suggestions.map((product) => (
                    <Chip
                      key={product.id}
                      icon={product.category_icon}
                      onPress={() => handlePickProduct(product)}
                    >
                      {`${product.name} · ${product.room_name}`}
                    </Chip>
                  ))}
                </View>
              </View>
            ) : null}

            <TextInput
              label="Quantidade"
              mode="outlined"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />

            <Text variant="titleSmall">Unidade</Text>
            <OptionChips options={unitOptions} value={unit} onChange={setUnit} />

            <HelperText type="error" visible={Boolean(error)}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              icon="plus"
              onPress={handleAddItem}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Adicionar
            </Button>
          </View>
        ) : (
          <View style={styles.form}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Uma linha por item: "- Nome #quantidade unidade". Use "# Título" para criar uma
              seção e "---" para um divisor. Linhas sem "-" também viram itens.
            </Text>

            <TextInput
              label="Itens e comandos"
              mode="outlined"
              value={text}
              onChangeText={setText}
              placeholder={COMMANDS_PLACEHOLDER}
              multiline
              numberOfLines={7}
              maxLength={5000}
              style={styles.commands}
            />

            <HelperText type="error" visible={Boolean(error)}>
              {error}
            </HelperText>

            {skipped.length > 0 ? (
              <View style={styles.skipped}>
                <Text variant="labelLarge" style={{ color: theme.colors.error }}>
                  Linhas ignoradas:
                </Text>
                {skipped.map((entry) => (
                  <Text key={`${entry.line}-${entry.text}`} variant="bodySmall">
                    {`Linha ${entry.line} (${entry.text}): ${entry.message}`}
                  </Text>
                ))}
              </View>
            ) : null}

            <Button
              mode="contained"
              icon="playlist-plus"
              onPress={handleImport}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Adicionar à lista
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
  form: {
    gap: 8,
  },
  suggestions: {
    gap: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commands: {
    minHeight: 150,
  },
  skipped: {
    gap: 2,
    marginBottom: 8,
  },
});