import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe } from '@/features/auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';

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
    // Verifica o token e extrai os dados diretamente (sem requisição extra ao backend)
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        
        // Decodifica o token localmente e pega o userId na mesma hora
        const decoded: any = jwtDecode(token);
        
        // Valida expiração simples
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expirado');
        }

        setUser({ id: Number(decoded.userId), name: decoded.name || 'Usuário', email: decoded.email || '' });
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
    try {
      // Extrai os dados do usuário na mesma hora do token do backend
      const decoded: any = jwtDecode(token);
      
      setUser({ id: Number(decoded.userId), name: decoded.name || 'Usuário', email: decoded.email || '' });
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
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

