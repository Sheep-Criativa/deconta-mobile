import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Responsible, getResponsibles, deleteResponsible } from '@/features/dashboard/services/responsible.service';
import { useAuth } from '@/features/auth/store/AuthContext';

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function ResponsiblesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResponsibles = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getResponsibles(user.id);
      setResponsibles(data);
    } catch {
      setResponsibles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchResponsibles();
    }, [fetchResponsibles])
  );

  const filtered = responsibles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (responsible: Responsible) => {
    Alert.alert(
      'Excluir responsável',
      `Deseja excluir "${responsible.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteResponsible(responsible.id, user!.id);
              setResponsibles((prev) => prev.filter((r) => r.id !== responsible.id));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o responsável.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Responsáveis',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={22} color="#18181b" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        {/* Search + Add row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#a1a1aa" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar responsável..."
              placeholderTextColor="#a1a1aa"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color="#a1a1aa" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/new-responsible' as any)}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#10b981" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Feather name="users" size={32} color="#a1a1aa" />
            </View>
            <Text style={styles.emptyTitle}>
              {search.length > 0 ? 'Nenhum resultado' : 'Nenhum responsável'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search.length > 0
                ? 'Tente outro termo de busca'
                : 'Toque no "+" para adicionar o primeiro responsável'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: item.color ?? '#10b981' }]}>
                  <Text style={styles.avatarText}>{getInitial(item.name)}</Text>
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#ecfdf5' : '#f4f4f5' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#10b981' : '#a1a1aa' }]} />
                    <Text style={[styles.statusText, { color: item.isActive ? '#059669' : '#71717a' }]}>
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#18181b',
    paddingVertical: 0,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#ffffff',
  },
  cardInfo: {
    flex: 1,
    gap: 5,
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    fontWeight: '600',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
  },
});
