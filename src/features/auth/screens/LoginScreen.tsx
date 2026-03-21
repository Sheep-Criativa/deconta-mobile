import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = (email: string, pass: string) => {
    router.replace('/(tabs)');
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

          <LoginForm onSubmit={handleLogin} />

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
