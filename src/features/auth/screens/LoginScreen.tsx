import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm, FormValues } from '@/features/auth/components/LoginForm';
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton';
import { loginUser } from '@/features/auth/services/auth.service';
import { useAuth } from '@/features/auth/store/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const response = await loginUser({ email: values.email, password: values.password, name: '' });
      login(response.token || 'session-token');
    } catch (error: any) {
      const msg =
        error?.response?.status === 401
          ? 'E-mail ou senha incorretos. Verifique seus dados.'
          : error?.response?.data?.message || 'Não foi possível conectar. Tente novamente.';
      Alert.alert('Erro ao entrar', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../../../assets/img-deconta/ceu1.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Overlay escuro sobre o fundo */}
        <View style={[styles.overlay, { paddingTop: insets.top }]}>

          {/* ── Hero: logo + tagline (altura fixa) ── */}
          <View style={styles.hero}>
            <Image
              source={require('../../../../assets/img-deconta/logoverticalbranco.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.heroTagline}>Controle financeiro na ponta dos dedos</Text>
          </View>

          {/*
            ── Card branco ──
            Estrutura correta para preencher o restante da tela sem gap:
            - View (cardContainer) com flex: 1 e as bordas arredondadas no topo
            - ScrollView DENTRO do View, não envolvendo ele
          */}
          <View style={styles.cardContainer}>
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.cardTitle}>Acesse sua conta</Text>
              <Text style={styles.cardSubtitle}>
                Continue de onde parou e mantenha o controle das suas finanças.
              </Text>

              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                submitLabel="Entrar"
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>ou continue com</Text>
                <View style={styles.dividerLine} />
              </View>

              <SocialLoginButton
                title="Entrar com Google"
                iconName="globe"
                iconColor="#10b981"
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
                    <Text style={styles.footerLink}>Criar conta</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </ScrollView>
          </View>

        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },

  /* Hero com altura fixa — NÃO usa flex */
  hero: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroLogo: {
    width: 160,
    height: 110,
    marginBottom: 10,
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  /*
   * cardContainer: ocupa todo o espaço restante (flex: 1)
   * Define o fundo branco e borda arredondada — sem depender de ScrollView
   */
  cardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  /* ScrollView interno — só rola o conteúdo, não define o fundo */
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 32,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#71717a',
    lineHeight: 21,
    marginBottom: 28,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f4f4f5',
  },
  dividerLabel: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#a1a1aa',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#71717a',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
});
