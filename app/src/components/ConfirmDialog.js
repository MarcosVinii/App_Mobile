import { Button, Dialog, Portal, Text } from 'react-native-paper';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Excluir',
  isLoading = false,
  onConfirm,
  onDismiss,
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onPress={onConfirm} loading={isLoading} disabled={isLoading}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}