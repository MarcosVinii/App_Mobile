import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';

import { getRoomStatus } from '../utils/roomStatus';
import EntityAvatar from './EntityAvatar';
import RoomStockSummary from './RoomStockSummary';

const AUTO_ADVANCE_MS = 4000;
const PAUSE_AFTER_INTERACTION_MS = 5 * 60 * 1000;
const CARD_GAP = 12;
const MAX_CARD_WIDTH = 340;
const SIDE_PADDING = 16;

function RoomSlide({ room, width, onPress }) {
  const status = getRoomStatus(room);

  return (
    <Card
      style={[styles.slide, { width }]}
      onPress={onPress}
      accessibilityLabel={`Abrir cômodo ${room.name}. ${status.label}`}
    >
      <Card.Content style={styles.slideContent}>
        <View style={styles.slideHeader}>
          <EntityAvatar size={52} icon={room.icon} image={room.image} />
          <View style={styles.slideTitle}>
            <Text variant="titleMedium" numberOfLines={1}>
              {room.name}
            </Text>
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name={status.icon} size={16} color={status.color} />
              <Text variant="labelMedium" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>
        <RoomStockSummary room={room} />
      </Card.Content>
    </Card>
  );
}

// Carrossel de cômodos: avança sozinho; se o usuário interagir, pausa por 5 minutos
export default function RoomCarousel({ rooms, onPressRoom }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();

  const listRef = useRef(null);
  const activeIndexRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const autoScrollUntilRef = useRef(0);
  const lastOffsetRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = Math.min(width - 48, MAX_CARD_WIDTH);
  const snapSize = cardWidth + CARD_GAP;

  const pauseAutoAdvance = useCallback(() => {
    pausedUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
  }, []);

  // isAuto: o movimento veio do temporizador (não conta como interação do usuário)
  const goToIndex = useCallback(
    (index, isAuto) => {
      if (isAuto) {
        const distance = Math.abs(index - activeIndexRef.current);
        autoScrollUntilRef.current = Date.now() + 800 + 300 * distance;
      }

      listRef.current?.scrollToOffset({ offset: index * snapSize, animated: true });
      activeIndexRef.current = index;
      setActiveIndex(index);
    },
    [snapSize]
  );

  useEffect(() => {
    if (!isFocused || rooms.length < 2) return undefined;

    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;

      const nextIndex = (activeIndexRef.current + 1) % rooms.length;
      goToIndex(nextIndex, true);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isFocused, rooms.length, goToIndex]);

  function handleScroll(event) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.min(Math.max(Math.round(offsetX / snapSize), 0), rooms.length - 1);

    activeIndexRef.current = index;
    setActiveIndex(index);

    const hasMoved = Math.abs(offsetX - lastOffsetRef.current) > 1;
    lastOffsetRef.current = offsetX;
    const isAutoScroll = Date.now() < autoScrollUntilRef.current;

    // Rolagem que não veio do temporizador é interação do usuário
    if (hasMoved && !isAutoScroll) {
      pauseAutoAdvance();
    }
  }

  function handleManualMove(index) {
    const target = Math.min(Math.max(index, 0), rooms.length - 1);

    pauseAutoAdvance();
    goToIndex(target, false);
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={rooms}
        horizontal
        keyExtractor={(room) => String(room.id)}
        renderItem={({ item }) => (
          <RoomSlide room={item} width={cardWidth} onPress={() => onPressRoom(item)} />
        )}
        snapToInterval={snapSize}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={pauseAutoAdvance}
        scrollEventThrottle={32}
        contentContainerStyle={styles.listContent}
      />

      {rooms.length > 1 ? (
        <View style={styles.controls}>
          <IconButton
            icon="chevron-left"
            size={22}
            disabled={activeIndex === 0}
            onPress={() => handleManualMove(activeIndex - 1)}
            accessibilityLabel="Cômodo anterior"
          />
          <View style={styles.dots}>
            {rooms.map((room, index) => (
              <Pressable
                key={room.id}
                onPress={() => handleManualMove(index)}
                accessibilityLabel={`Ir para o cômodo ${room.name}`}
                hitSlop={6}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === activeIndex ? theme.colors.primary : theme.colors.outlineVariant,
                  },
                ]}
              />
            ))}
          </View>
          <IconButton
            icon="chevron-right"
            size={22}
            disabled={activeIndex === rooms.length - 1}
            onPress={() => handleManualMove(activeIndex + 1)}
            accessibilityLabel="Próximo cômodo"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 4,
    gap: CARD_GAP,
  },
  slide: {
    justifyContent: 'center',
  },
  slideContent: {
    gap: 14,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slideTitle: {
    flex: 1,
    gap: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    maxWidth: 200,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});