import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe } from '@/features/auth/services/auth.service';

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica o token salvo E valida contra a API ao iniciar o app
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        // Valida o token contra a API e obtém o usuário logado
        const me = await getMe();
        setUser({ id: Number(me.id), name: me.name, email: me.email });
        setIsAuthenticated(true);
      } catch {
        // Token inválido ou expirado: limpa tudo
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (token: string) => {
    await SecureStore.setItemAsync('accessToken', token);
    // Busca os dados do usuário após o login
    try {
      const me = await getMe();
      setUser({ id: me.id, name: me.name, email: me.email });
    } catch {
      setUser(null);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

