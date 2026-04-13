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

import {
  Responsible,
  getResponsibles,
  deleteResponsible,
} from '@/features/dashboard/services/responsible.service';
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

  useFocusEffect(useCallback(() => { fetchResponsibles(); }, [fetchResponsibles]));

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

  const goToNew = () => router.push('/(tabs)/new-responsible' as any);
  const goToEdit = (r: Responsible) =>
    router.push({
      pathname: '/(tabs)/new-responsible' as any,
      params: { id: String(r.id), name: r.name, color: r.color ?? '#10b981' },
    });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>

        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View>
            <Text style={styles.headerTitle}>Responsáveis</Text>
            <Text style={styles.headerSub}>
              {responsibles.length} responsáve{responsibles.length !== 1 ? 'is' : 'l'} cadastrado{responsibles.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={goToNew} activeOpacity={0.85}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Busca ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#a1a1aa" />
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
                <Feather name="x" size={14} color="#a1a1aa" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Lista ── */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#10b981" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIconBox}>
              <Feather name="users" size={32} color="#d4d4d8" />
            </View>
            <Text style={styles.emptyTitle}>
              {search.length > 0 ? 'Nenhum resultado' : 'Nenhum responsável'}
            </Text>
            <Text style={styles.emptySub}>
              {search.length > 0
                ? 'Tente ajustar o termo de busca'
                : 'Toque no "+" para adicionar o primeiro responsável'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => goToEdit(item)}
                activeOpacity={0.75}
              >
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
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => goToEdit(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="edit-2" size={14} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="trash-2" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, marginBottom: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#18181b' },
  headerSub: { fontSize: 12, color: '#a1a1aa', fontWeight: '500', marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#10b981',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },

  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 44,
    borderWidth: 1, borderColor: '#f4f4f5',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#18181b', fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingBottom: 40 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 18, padding: 14, gap: 12,
    borderWidth: 1, borderColor: '#f4f4f5',
  },
  avatar: { width: 46, height: 46, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#ffffff' },
  cardInfo: { flex: 1, gap: 5 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#18181b' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 9999 },
  statusText: { fontSize: 11, fontFamily: 'Poppins_500Medium', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#18181b', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#a1a1aa', textAlign: 'center', lineHeight: 20 },
});
