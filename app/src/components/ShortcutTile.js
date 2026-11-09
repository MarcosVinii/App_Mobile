import { StyleSheet } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';

export default function ShortcutTile({ icon, label, onPress }) {
  return (
    <Card
      style={styles.tile}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Card.Content style={styles.content}>
        <Avatar.Icon size={44} icon={icon} />
        <Text variant="labelLarge" style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 96,
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    textAlign: 'center',
  },
});