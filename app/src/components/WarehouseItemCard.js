import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';

import { formatShortDate } from '../utils/dates';
import { formatQuantity } from '../utils/units';

export default function WarehouseItemCard({ item, onOrganize, onLinkCandidate, onDiscard }) {
  const theme = useTheme();
  const origin = item.list_title ? `Lista: ${item.list_title}` : 'Sem lista';
  const subtitle = `${formatQuantity(item.quantity, item.unit)} · ${origin} · ${formatShortDate(
    item.purchased_at
  )}`;

  return (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        titleVariant="titleMedium"
        subtitle={subtitle}
        subtitleNumberOfLines={2}
        left={(props) => <Avatar.Icon {...props} icon="package-variant-closed" />}
      />

      {item.candidates.length > 0 ? (
        <Card.Content style={styles.candidates}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Somar a um produto do estoque:
          </Text>
          <View style={styles.chips}>
            {item.candidates.map((candidate) => (
              <Chip
                key={candidate.id}
                icon={candidate.match === 'exact' ? 'link-variant' : 'help-circle-outline'}
                onPress={() => onLinkCandidate(candidate)}
              >
                {`${candidate.name} · ${candidate.room_name} (${
                  candidate.match === 'exact' ? 'mesmo nome' : 'parecido'
                })`}
              </Chip>
            ))}
          </View>
        </Card.Content>
      ) : null}

      <Card.Actions>
        <Button mode="contained-tonal" onPress={onOrganize}>
          Organizar
        </Button>
        <IconButton
          icon="trash-can-outline"
          onPress={onDiscard}
          accessibilityLabel={`Remover ${item.name} do Armazém`}
        />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  candidates: {
    gap: 8,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});