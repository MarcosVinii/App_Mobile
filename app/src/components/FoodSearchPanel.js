import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  List,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { searchFoods } from '../services/openFoodFactsService';

// Pesquisa opcional no Open Food Facts para preencher o cadastro do produto
export default function FoodSearchPanel({ onSelect }) {
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (query.trim().length < 2) {
      setError('Digite pelo menos 2 letras para buscar.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);
    setHasSearched(false);

    try {
      setResults(await searchFoods(query));
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(food) {
    onSelect(food);
    setIsOpen(false);
    setResults([]);
    setHasSearched(false);
    setQuery('');
  }

  if (!isOpen) {
    return (
      <Button
        mode="outlined"
        icon="magnify"
        onPress={() => setIsOpen(true)}
        style={styles.openButton}
      >
        Buscar alimento no Open Food Facts
      </Button>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleSmall">Open Food Facts</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Pesquise pelo nome do alimento para preencher nome e descrição. Você pode ajustar tudo
          depois.
        </Text>

        <TextInput
          label="Nome ou marca do alimento"
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        <Button
          mode="contained"
          icon="magnify"
          onPress={handleSearch}
          loading={isLoading}
          disabled={isLoading}
        >
          Buscar
        </Button>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator accessibilityLabel="Buscando alimentos" />
            <Text variant="bodySmall">Consultando o Open Food Facts...</Text>
          </View>
        ) : null}

        {error ? (
          <View>
            <HelperText type="error" visible>
              {error}
            </HelperText>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Você pode continuar e preencher o produto manualmente.
            </Text>
          </View>
        ) : null}

        {hasSearched && results.length === 0 ? (
          <Text variant="bodyMedium">Nenhum alimento encontrado. Tente outro nome.</Text>
        ) : null}

        {results.map((food, index) => (
          <List.Item
            key={`${food.barcode || 'sem-codigo'}-${index}`}
            title={food.name}
            description={food.description || 'Sem detalhes'}
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="food-apple-outline" />}
            onPress={() => handleSelect(food)}
          />
        ))}

        <Button onPress={() => setIsOpen(false)}>Fechar busca</Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  openButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});