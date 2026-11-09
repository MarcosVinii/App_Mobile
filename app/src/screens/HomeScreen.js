import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import RoomCarousel from '../components/RoomCarousel';
import ShortcutTile from '../components/ShortcutTile';
import StatusView from '../components/StatusView';
import SummaryCard from '../components/SummaryCard';
import WarehouseFab from '../components/WarehouseFab';
import useAuth from '../hooks/useAuth';
import useRooms from '../hooks/useRooms';
import useToast from '../hooks/useToast';
import { statusColors } from '../theme/theme';

function SectionTitle({ children }) {
  return (
    <Text variant="titleMedium" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { rooms, isLoading, error, reload } = useRooms();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const totals = useMemo(
    () =>
      rooms.reduce(
        (sum, room) => ({
          products: sum.products + room.total_products,
          low: sum.low + room.low_stock_products,
          out: sum.out + room.out_of_stock_products,
        }),
        { products: 0, low: 0, out: 0 }
      ),
    [rooms]
  );

  const firstName = user.name.split(' ')[0];
  const mutedColor = theme.colors.onSurfaceVariant;

  function showComingSoon(featureName) {
    showToast(`[${featureName}] ainda será implementado.`, { type: 'info' });
  }

  function openSmartList() {
    navigation.navigate('ShoppingListDetails', { smart: true });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={() => reload(true)}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.greeting}>
            <Text variant="headlineSmall">Olá, {firstName}!</Text>
            <Text variant="bodyMedium" style={{ color: mutedColor }}>
              Veja como está a sua casa hoje.
            </Text>
          </View>

          <View style={styles.summary}>
            <SummaryCard
              icon="door"
              value={rooms.length}
              label={rooms.length === 1 ? 'Cômodo' : 'Cômodos'}
              onPress={() => navigation.navigate('Rooms')}
            />
            <SummaryCard
              icon="package-variant"
              value={totals.products}
              label={totals.products === 1 ? 'Produto' : 'Produtos'}
              onPress={() => navigation.navigate('Rooms')}
            />
            <SummaryCard
              icon="alert"
              value={totals.low}
              label="Estoque baixo"
              color={totals.low > 0 ? statusColors.lowStock : mutedColor}
              onPress={openSmartList}
            />
            <SummaryCard
              icon="alert-circle"
              value={totals.out}
              label="Sem estoque"
              color={totals.out > 0 ? statusColors.outOfStock : mutedColor}
              onPress={openSmartList}
            />
          </View>

          <View style={styles.sectionHeader}>
            <SectionTitle>Seus cômodos</SectionTitle>
            {rooms.length > 0 ? (
              <Button compact onPress={() => navigation.navigate('Rooms')}>
                Ver todos
              </Button>
            ) : null}
          </View>

          {rooms.length > 0 ? (
            <RoomCarousel
              rooms={rooms}
              onPressRoom={(room) => navigation.navigate('RoomDetails', { roomId: room.id })}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Você ainda não tem cômodos. Crie o primeiro para começar a organizar a casa.
                </Text>
                <Button mode="contained" icon="plus" onPress={() => navigation.navigate('RoomForm')}>
                  Criar cômodo
                </Button>
              </Card.Content>
            </Card>
          )}

          <View style={styles.padded}>
            <SectionTitle>Atalhos rápidos</SectionTitle>
            <View style={styles.tiles}>
              <ShortcutTile
                icon="door-open"
                label="Novo cômodo"
                onPress={() => navigation.navigate('RoomForm')}
              />
              <ShortcutTile
                icon="package-variant-plus"
                label="Novo produto"
                onPress={() => navigation.navigate('ProductForm')}
              />
              <ShortcutTile
                icon="cart-plus"
                label="Nova lista"
                onPress={() => navigation.navigate('ShoppingListForm')}
              />
            </View>

            <SectionTitle>Em breve</SectionTitle>
            <View style={styles.tiles}>
              <ShortcutTile
                icon="format-list-checks"
                label="Tarefas"
                onPress={() => showComingSoon('Tarefas')}
              />
              <ShortcutTile
                icon="chef-hat"
                label="Receitas"
                onPress={() => showComingSoon('Receitas')}
              />
              <ShortcutTile
                icon="account-group-outline"
                label="Compartilhamento"
                onPress={() => showComingSoon('Compartilhamento')}
              />
            </View>
          </View>
        </ScrollView>
      </StatusView>

      <WarehouseFab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 96,
  },
  greeting: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  padded: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tiles: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  emptyCard: {
    marginHorizontal: 16,
  },
  emptyContent: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
  },
});