import { useEffect, useState } from 'react';
import { Button, Dialog, HelperText, Portal, TextInput } from 'react-native-paper';

// Janela com um campo de texto (usada para criar e renomear seções)
export default function TextPromptDialog({
  visible,
  title,
  label,
  initialValue = '',
  confirmLabel = 'Salvar',
  isLoading = false,
  onConfirm,
  onDismiss,
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setError('');
    }
  }, [visible, initialValue]);

  function handleConfirm() {
    const trimmed = value.trim();

    if (trimmed.length < 2 || trimmed.length > 40) {
      setError('O título deve ter entre 2 e 40 caracteres.');
      return;
    }

    onConfirm(trimmed);
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label={label}
            mode="outlined"
            value={value}
            onChangeText={setValue}
            maxLength={40}
            autoFocus
            error={Boolean(error)}
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error}
          </HelperText>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onPress={handleConfirm} loading={isLoading} disabled={isLoading}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}