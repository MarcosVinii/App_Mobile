import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import useToast from '../hooks/useToast';
import { isCameraAvailable, pickImage } from '../utils/imagePicker';
import EntityAvatar from './EntityAvatar';

// Campo de foto opcional: galeria, câmera e remover (volta ao ícone padrão)
export default function ImagePickerField({ image, icon, onChange }) {
  const theme = useTheme();
  const { showToast } = useToast();
  const [isPicking, setIsPicking] = useState(false);

  async function handlePick(source) {
    setIsPicking(true);
    try {
      const result = await pickImage(source);

      if (result.status === 'ok') {
        onChange(result.dataUrl);
      } else if (result.status === 'denied') {
        const place = source === 'camera' ? 'da câmera' : 'da galeria';
        showToast(
          `Permissão ${place} negada. Libere o acesso nas configurações do aparelho.`,
          { type: 'error' }
        );
      }
    } catch (error) {
      showToast('Não foi possível carregar a foto. Tente novamente.', { type: 'error' });
    } finally {
      setIsPicking(false);
    }
  }

  return (
    <View style={styles.row}>
      <EntityAvatar size={72} image={image} icon={icon} />
      <View style={styles.actions}>
        <Text variant="titleSmall">Foto (opcional)</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Sem foto, usamos o ícone padrão.
        </Text>
        <View style={styles.buttons}>
          <Button
            mode="outlined"
            icon="image-outline"
            compact
            onPress={() => handlePick('gallery')}
            disabled={isPicking}
          >
            Galeria
          </Button>
          {isCameraAvailable ? (
            <Button
              mode="outlined"
              icon="camera-outline"
              compact
              onPress={() => handlePick('camera')}
              disabled={isPicking}
            >
              Câmera
            </Button>
          ) : null}
          {image ? (
            <Button compact onPress={() => onChange(null)} disabled={isPicking}>
              Remover foto
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 12,
  },
  actions: {
    flex: 1,
    gap: 4,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
});