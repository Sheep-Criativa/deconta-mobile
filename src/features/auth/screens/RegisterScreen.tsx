import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton';

import { registerUser } from '@/features/auth/services/auth.service';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(email: string, password: string, name?: string) {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }
    
    try {
      setIsLoading(true);
      const data = { name, email, password };
      await registerUser(data);
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      console.error('Error registering user:', error);
      Alert.alert(
        'Erro ao criar conta', 
        error?.response?.data?.message || 'Verifique seus dados e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  }

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

          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Acesse suas finanças a qualquer momento e mantenha tudo organizado em um só lugar.</Text>

          <LoginForm 
            onSubmit={handleRegister} 
            showNameField={true} 
            isLoading={isLoading} 
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou continue com:</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialLoginButton 
            title="Criar conta com Google"
            iconName="globe"
            iconColor="#ea4335"
          />

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Já possui uma conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Entrar</Text>
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
