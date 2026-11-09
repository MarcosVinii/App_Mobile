import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import * as productService from '../services/productService';
import { notifyStockAlerts } from '../services/notificationService';
import usePreferences from './usePreferences';

// Quando a tela ganha foco e os alertas estão ligados, avisa sobre estoque novo em alerta
export default function useStockNotifications() {
  const { stockNotifications } = usePreferences();

  useFocusEffect(
    useCallback(() => {
      if (!stockNotifications) return undefined;

      let isActive = true;

      productService
        .listProducts()
        .then((products) => (isActive ? notifyStockAlerts(products) : null))
        .catch(() => {});

      return () => {
        isActive = false;
      };
    }, [stockNotifications])
  );
}