import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

import useAuth from '../hooks/useAuth';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Nome
          </Text>
          <Text variant="titleMedium" style={styles.field}>
            {user.name}
          </Text>

          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            E-mail
          </Text>
          <Text variant="titleMedium">{user.email}</Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" icon="logout" onPress={signOut}>
        Sair da conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  card: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
});