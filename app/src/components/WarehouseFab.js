import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, FAB } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import * as warehouseService from '../services/warehouseService';

// Botão flutuante do Armazém: só aparece quando há itens aguardando organização
export default function WarehouseFab() {
  const navigation = useNavigation();
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      warehouseService
        .getPendingCount()
        .then((total) => {
          if (isActive) setCount(total);
        })
        .catch(() => {});

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (count <= 0) return null;

  return (
    <View style={styles.wrapper}>
      <FAB
        icon="package-variant-closed"
        onPress={() => navigation.navigate('Warehouse')}
        accessibilityLabel={`Armazém de Compras: ${count} ${
          count === 1 ? 'item aguardando' : 'itens aguardando'
        } organização`}
      />
      <Badge size={24} style={styles.badge}>
        {count > 99 ? '99+' : count}
      </Badge>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
});