import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getSmartOrganization,
  getStockNotifications,
  saveSmartOrganization,
  saveStockNotifications,
} from '../storage/preferencesStorage';

export const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [smartOrganization, setSmartOrganizationState] = useState(true);
  const [stockNotifications, setStockNotificationsState] = useState(false);

  useEffect(() => {
    Promise.all([getSmartOrganization(), getStockNotifications()])
      .then(([smart, notifications]) => {
        setSmartOrganizationState(smart);
        setStockNotificationsState(notifications);
      })
      .catch(() => {});
  }, []);

  const setSmartOrganization = useCallback((value) => {
    setSmartOrganizationState(value);
    saveSmartOrganization(value).catch(() => {});
  }, []);

  const setStockNotifications = useCallback((value) => {
    setStockNotificationsState(value);
    saveStockNotifications(value).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      smartOrganization,
      setSmartOrganization,
      stockNotifications,
      setStockNotifications,
    }),
    [smartOrganization, setSmartOrganization, stockNotifications, setStockNotifications]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}