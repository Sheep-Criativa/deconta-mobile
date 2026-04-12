import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '@/features/auth/store/AuthContext';
import { logoutUser } from '@/features/auth/services/auth.service';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              // Tenta notificar a API (best-effort)
              await logoutUser().catch(() => {});
            } finally {
              // Sempre limpa o estado local e redireciona
              await logout();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {user?.name ?? 'Usuário'}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={16} color="#10b981" onPress={() => router.push('/profile')} />
        </TouchableOpacity>
      </View>

      {/* Seção: Conta */}
      <Text style={styles.sectionTitle}>Conta</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="user" label="Dados pessoais" onPress={() => router.push('/profile')} />
        <Divider />
        <MenuItem icon="lock" label="Alterar senha" onPress={() => router.push('/change-password')} />
      </View>

      {/* Seção: Preferências */}
      <Text style={styles.sectionTitle}>Preferências</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="globe" label="Idioma" value="Português (BR)" />
        <Divider />
        <MenuItem icon="dollar-sign" label="Moeda" value="BRL (R$)" />
      </View>

      {/* Seção: Suporte */}
      <Text style={styles.sectionTitle}>Suporte</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="help-circle" label="Central de ajuda" onPress={() => router.push('/support')} />
        <Divider />
        <MenuItem icon="file-text" label="Termos de uso" />
        <Divider />
        <MenuItem icon="shield" label="Política de privacidade" />
      </View>

      {/* Botão Sair */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Feather name="log-out" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.version}>DeConta v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.menuIconBox}>
        <Feather name={icon} size={17} color="#10b981" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Feather name="chevron-right" size={16} color="#a1a1aa" />
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 4,
  },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#065f46',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#71717a',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#18181b',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#71717a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginLeft: 60,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ef4444',
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#d4d4d8',
    marginTop: 16,
  },
});

