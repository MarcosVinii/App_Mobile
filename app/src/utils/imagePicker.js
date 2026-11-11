import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const TARGET_WIDTH = 256;
const JPEG_QUALITY = 0.6;

// A câmera não existe na versão web
export const isCameraAvailable = Platform.OS !== 'web';

// source: 'camera' ou 'gallery'.
// Devolve { status: 'ok', dataUrl } | { status: 'cancelled' } | { status: 'denied' }
export async function pickImage(source) {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return { status: 'denied' };
  }

  const options = { allowsEditing: true, aspect: [1, 1], quality: 0.8 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) {
    return { status: 'cancelled' };
  }

  // Reduz e comprime para a foto ficar leve (alguns KB) antes de enviar
  const resized = await manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: TARGET_WIDTH } }],
    { compress: JPEG_QUALITY, format: SaveFormat.JPEG, base64: true }
  );

  return { status: 'ok', dataUrl: `data:image/jpeg;base64,${resized.base64}` };
}