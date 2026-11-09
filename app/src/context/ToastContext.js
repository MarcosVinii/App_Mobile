import { createContext, useCallback, useMemo, useRef, useState } from 'react';

import ToastHost from '../components/ToastHost';

export const ToastContext = createContext(null);

const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // type: 'info' | 'success' | 'error'
  const showToast = useCallback((message, { type = 'info', duration = DEFAULT_DURATION } = {}) => {
    const id = nextId.current;
    nextId.current += 1;

    setToasts((current) => [
      ...current.slice(-(MAX_VISIBLE_TOASTS - 1)),
      { id, message, type, duration },
    ]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}