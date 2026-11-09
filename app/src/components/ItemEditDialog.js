import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, HelperText, Portal, Text, TextInput, useTheme } from 'react-native-paper';

import { formatNumber, parseDecimal } from '../utils/numbers';
import { UNITS } from '../utils/units';
import OptionChips from './OptionChips';

const unitOptions = UNITS.map((unit) => ({ value: unit.code, label: unit.label }));

// Edição de um item da lista: nome, quantidade, unidade, seção e remoção
export default function ItemEditDialog({ item, sections, isWorking, onSave, onRemove, onDismiss }) {
  const theme = useTheme();

  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(formatNumber(item.quantity));
  const [unit, setUnit] = useState(item.unit);
  const [sectionKey, setSectionKey] = useState(item.section_id ?? 'none');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState('');

  const sectionOptions = [
    { value: 'none', label: 'Sem seção', icon: 'tray' },
    ...sections.map((section) => ({
      value: section.id,
      label: section.title,
      icon: 'folder-outline',
    })),
  ];

  function handleSave() {
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
    onSave({ name: name.trim(), quantity: parsedQuantity, unit, sectionKey });
  }

  function handleRemovePress() {
    if (confirmRemove) {
      onRemove();
      return;
    }

    setConfirmRemove(true);
  }

  return (
    <Portal>
      <Dialog visible onDismiss={onDismiss}>
        <Dialog.Title>Editar item</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TextInput
              label="Nome"
              mode="outlined"
              value={name}
              onChangeText={setName}
              maxLength={60}
            />

            <TextInput
              label="Quantidade"
              mode="outlined"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />

            <Text variant="titleSmall">Unidade</Text>
            <OptionChips options={unitOptions} value={unit} onChange={setUnit} />

            {sections.length > 0 ? (
              <>
                <Text variant="titleSmall">Mover para</Text>
                <OptionChips
                  options={sectionOptions}
                  value={sectionKey}
                  onChange={setSectionKey}
                />
              </>
            ) : null}

            <HelperText type="error" visible={Boolean(error)}>
              {error}
            </HelperText>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button textColor={theme.colors.error} onPress={handleRemovePress} disabled={isWorking}>
            {confirmRemove ? 'Confirmar remoção' : 'Remover'}
          </Button>
          <Button onPress={onDismiss} disabled={isWorking}>
            Cancelar
          </Button>
          <Button onPress={handleSave} loading={isWorking} disabled={isWorking}>
            Salvar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 420,
  },
  content: {
    gap: 12,
    paddingVertical: 8,
  },
});