import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';

export default function SummaryCard({ icon, value, label, color, onPress }) {
  const theme = useTheme();
  const accent = color || theme.colors.primary;

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Card.Content style={styles.content}>
        <MaterialCommunityIcons name={icon} size={28} color={accent} />
        <View>
          <Text variant="headlineSmall" style={{ color: accent }}>
            {value}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});