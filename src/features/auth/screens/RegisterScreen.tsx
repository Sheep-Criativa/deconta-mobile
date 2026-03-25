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
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm, FormValues } from '@/features/auth/components/LoginForm';
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton';
import { registerUser } from '@/features/auth/services/auth.service';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await registerUser({ name: values.name!, email: values.email, password: values.password });
      Alert.alert(
        '✅ Conta criada!',
        'Sua conta foi criada com sucesso. Agora é só entrar!',
        [{ text: 'Entrar agora', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const msg =
        error?.response?.status === 409
          ? 'Este e-mail já está em uso. Tente outro ou faça login.'
          : error?.response?.data?.message || 'Não foi possível criar a conta. Tente novamente.';
      Alert.alert('Erro ao criar conta', msg);
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
        <View style={[styles.overlay, { paddingTop: insets.top }]}>

          {/* ── Hero: logo + badge (altura fixa) ── */}
          <View style={styles.hero}>
            <Image
              source={require('../../../../assets/img-deconta/logoverticalbranco.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Crie sua conta grátis</Text>
            </View>
          </View>

          {/*
            ── Card branco ──
            View com flex: 1 define o fundo e as bordas — ScrollView fica DENTRO
          */}
          <View style={styles.cardContainer}>
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.cardTitle}>Vamos começar!</Text>
              <Text style={styles.cardSubtitle}>
                Crie sua conta e tenha o controle total das suas finanças em um só lugar.
              </Text>

              <LoginForm
                onSubmit={handleRegister}
                showNameField={true}
                isLoading={isLoading}
                submitLabel="Criar conta"
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>ou registre-se com</Text>
                <View style={styles.dividerLine} />
              </View>

              <SocialLoginButton
                title="Criar conta com Google"
                iconName="globe"
                iconColor="#10b981"
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem uma conta? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
                    <Text style={styles.footerLink}>Entrar</Text>
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

  /* Hero com altura fixa */
  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  heroLogo: {
    width: 150,
    height: 100,
  },
  heroBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  /* Card: flex:1 garante preenchimento até o final da tela */
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
