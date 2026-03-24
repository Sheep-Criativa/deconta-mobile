import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular a leitura do token assincronamente na inicialização do app
    const checkToken = async () => {
      // Ex: verificar AsyncStorage ou SecureStore
      // const token = await SecureStore.getItemAsync('userToken');
      // se token válido => setIsAuthenticated(true);
      
      // Simulação rápida para propósitos deste fluxo inicial
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    checkToken();
  }, []);

  const login = (token: string) => {
    // Ex: await SecureStore.setItemAsync('userToken', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Ex: await SecureStore.deleteItemAsync('userToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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
