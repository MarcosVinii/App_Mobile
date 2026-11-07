import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { statusColors } from '../theme/theme';

// Mostra carregamento ou erro; quando está tudo certo, mostra o conteúdo
export default function StatusView({ isLoading, error, onRetry, children }) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" accessibilityLabel="Carregando" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={40}
          color={statusColors.outOfStock}
        />
        <Text variant="bodyLarge" style={styles.message}>
          {error}
        </Text>
        {onRetry ? (
          <Button mode="outlined" onPress={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    marginVertical: 12,
  },
});