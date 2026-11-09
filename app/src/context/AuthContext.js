import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { getToken, removeToken, saveToken } from '../storage/tokenStorage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao abrir o app, tenta restaurar a sessão a partir do token salvo
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getToken();
        if (token) {
          const currentUser = await authService.fetchCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        // Token inválido, expirado ou usuário removido: limpa a sessão
        if (error.status === 401 || error.status === 404) {
          await removeToken();
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    await saveToken(result.token);
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    const result = await authService.register(name, email, password);
    await saveToken(result.token);
    setUser(result.user);
  }, []);

  const signOut = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  // Atualiza os dados do usuário na tela depois de editar o perfil
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut, updateUser }),
    [user, isLoading, signIn, signUp, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}