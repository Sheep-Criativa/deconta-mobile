import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton';

import { loginUser } from '@/features/auth/services/auth.service';
import { useAuth } from '@/features/auth/store/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (email: string, pass: string) => {
    if (!email || !pass) {
      Alert.alert('Erro', 'Preencha o e-mail e a senha.');
      return;
    }

    try {
      setIsLoading(true);
      // Chama a API que o usuário construiu em auth.service.ts
      const response = await loginUser({ email, password: pass, name: '' });
      
      // Armazenamos o token no contexto (e ele cuida de redirecionar para tabs pelo _layout.tsx)
      login(response.token || 'fake-token'); 
    } catch (error: any) {
      console.error('Error logging in:', error);
      Alert.alert('Erro no Login', error?.response?.data?.message || 'E-mail ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer, 
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }
        ]}
      >
        <View style={styles.formContainer}>
          
          <View style={styles.logoBox}>
            <View style={styles.logoInnerDot} />
            <Text style={styles.logoText}>i</Text>
          </View>

          <Text style={styles.title}>Acesse sua conta</Text>
          <Text style={styles.subtitle}>Continue de onde parou. Suas finanças estão aqui.</Text>

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} submitLabel="Entrar" />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou continue com:</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialLoginButton 
            title="Fazer Login com o Google"
            iconName="globe"
            iconColor="#ea4335"
          />

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Criar conta</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative'
  },
  logoInnerDot: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff'
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    marginTop: 4
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#18181b', // zinc-900
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a', // zinc-500
    marginBottom: 32,
    lineHeight: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f4f4f5', // zinc-100
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#a1a1aa', // zinc-400
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#71717a',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
