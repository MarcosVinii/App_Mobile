import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

import RoomIconPicker from '../components/RoomIconPicker';
import StatusView from '../components/StatusView';
import * as roomService from '../services/roomService';
import { DEFAULT_ROOM_ICON, SUGGESTED_ROOMS } from '../utils/roomIcons';
import { validateRoomForm } from '../utils/validators';

export default function RoomFormScreen({ route, navigation }) {
  const roomId = route.params?.roomId;
  const isEditing = Boolean(roomId);
  const theme = useTheme();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ROOM_ICON);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');

  // No modo edição, carrega o cômodo para preencher o formulário
  const loadRoom = useCallback(async () => {
    if (!isEditing) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const room = await roomService.getRoom(roomId);
      setName(room.name);
      setIcon(room.icon);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  function applySuggestion(suggestion) {
    setName(suggestion.name);
    setIcon(suggestion.icon);
    setErrors({});
  }

  async function handleSave() {
    const validationErrors = validateRoomForm({ name });
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const data = { name: name.trim(), icon };

      if (isEditing) {
        await roomService.updateRoom(roomId, data);
      } else {
        await roomService.createRoom(data);
      }

      navigation.goBack();
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
      <StatusView isLoading={isLoading} error={loadError} onRetry={loadRoom}>
        <View style={styles.form}>
          {!isEditing ? (
            <>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Sugestões
              </Text>
              <View style={styles.chips}>
                {SUGGESTED_ROOMS.map((suggestion) => (
                  <Chip
                    key={suggestion.name}
                    icon={suggestion.icon}
                    onPress={() => applySuggestion(suggestion)}
                  >
                    {suggestion.name}
                  </Chip>
                ))}
              </View>
            </>
          ) : null}

          <TextInput
            label="Nome do cômodo"
            mode="outlined"
            value={name}
            onChangeText={setName}
            maxLength={40}
            error={Boolean(errors.name)}
          />
          <HelperText type="error" visible={Boolean(errors.name)}>
            {errors.name}
          </HelperText>

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Ícone
          </Text>
          <RoomIconPicker value={icon} onChange={setIcon} />

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
            {isEditing ? 'Salvar alterações' : 'Adicionar cômodo'}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
  },
});