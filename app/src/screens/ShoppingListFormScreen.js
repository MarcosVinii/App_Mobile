import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

import OptionChips from '../components/OptionChips';
import StatusView from '../components/StatusView';
import * as shoppingListService from '../services/shoppingListService';
import { validateListForm } from '../utils/shoppingValidators';

const TITLE_SUGGESTIONS = [
  'Compras do mês',
  'Feira',
  'Produtos de limpeza',
  'Cozinha',
  'Banheiro',
].map((title) => ({ value: title, label: title }));

export default function ShoppingListFormScreen({ route, navigation }) {
  const listId = route.params?.listId;
  const isEditing = Boolean(listId);
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');

  // No modo edição, carrega a lista para preencher o título
  const loadList = useCallback(async () => {
    if (!isEditing) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const detail = await shoppingListService.getListDetail(listId);
      setTitle(detail.list.title);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, listId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  async function handleSave() {
    const validationErrors = validateListForm({ title });
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await shoppingListService.renameList(listId, title.trim());
        navigation.goBack();
      } else {
        const created = await shoppingListService.createList(title.trim());
        // Abre a lista recém-criada; voltar leva à aba Compras
        navigation.replace('ShoppingListDetails', { listId: created.id });
      }
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StatusView isLoading={isLoading} error={loadError} onRetry={loadList}>
        <View style={styles.form}>
          {!isEditing ? (
            <>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Sugestões
              </Text>
              <View style={styles.chips}>
                <OptionChips options={TITLE_SUGGESTIONS} value={title} onChange={setTitle} />
              </View>
            </>
          ) : null}

          <TextInput
            label="Título da lista"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            error={Boolean(errors.title)}
          />
          <HelperText type="error" visible={Boolean(errors.title)}>
            {errors.title}
          </HelperText>

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
            {isEditing ? 'Salvar alterações' : 'Criar lista'}
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
    marginBottom: 8,
  },
  chips: {
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
  },
});