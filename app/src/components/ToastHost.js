import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPE_STYLES = {
  info: { icon: 'information-outline', color: '#9EC5B5' },
  success: { icon: 'check-circle-outline', color: '#8FD3A8' },
  error: { icon: 'alert-circle-outline', color: '#F2A199' },
};

// Abaixo do cabeçalho das telas, para não cobrir os botões do topo
const TOP_OFFSET = 64;

function ToastItem({ toast, onDismiss }) {
  const theme = useTheme();
  const progress = useRef(new Animated.Value(1)).current;
  const typeStyle = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: toast.duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) onDismiss(toast.id);
    });

    return () => animation.stop();
  }, [progress, toast.id, toast.duration, onDismiss]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPress={() => onDismiss(toast.id)}
      accessibilityRole="alert"
      accessibilityLabel={toast.message}
      accessibilityHint="Toque para fechar"
      style={[styles.toast, { backgroundColor: theme.colors.inverseSurface }]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons name={typeStyle.icon} size={22} color={typeStyle.color} />
        <Text
          variant="bodyMedium"
          style={[styles.message, { color: theme.colors.inverseOnSurface }]}
        >
          {toast.message}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.bar, { backgroundColor: typeStyle.color, width: barWidth }]}
        />
      </View>
    </Pressable>
  );
}

export default function ToastHost({ toasts, onDismiss }) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.host, { top: insets.top + TOP_OFFSET, pointerEvents: 'box-none' }]}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 1000,
    elevation: 10,
  },
  toast: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  message: {
    flex: 1,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  bar: {
    height: 4,
  },
});