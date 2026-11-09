import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { getSmartOrganization, saveSmartOrganization } from '../storage/preferencesStorage';

export const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [smartOrganization, setSmartOrganizationState] = useState(true);

  useEffect(() => {
    getSmartOrganization()
      .then(setSmartOrganizationState)
      .catch(() => {});
  }, []);

  const setSmartOrganization = useCallback((value) => {
    setSmartOrganizationState(value);
    saveSmartOrganization(value).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ smartOrganization, setSmartOrganization }),
    [smartOrganization, setSmartOrganization]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}