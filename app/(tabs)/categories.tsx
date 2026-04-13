import React, { useState, useCallback, useMemo } from 'react';
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

// Converte nomes PascalCase do Lucide (salvo no banco pelo web) para kebab-case do Feather (mobile)
const ICON_MAP_MOBILE: Record<string, string> = {
  Wallet: 'briefcase', Landmark: 'home', GraduationCap: 'book',
  Plane: 'navigation', Car: 'truck', ShoppingBag: 'shopping-bag',
  Heart: 'heart', Music: 'music', Book: 'book', Briefcase: 'briefcase',
  Tool: 'tool', Gift: 'gift', Coffee: 'coffee', Zap: 'zap',
  Truck: 'truck', Film: 'film', Globe: 'globe', Award: 'award',
  Anchor: 'anchor', Tag: 'tag', DollarSign: 'dollar-sign',
  BarChart2: 'bar-chart-2', Cpu: 'cpu', Sun: 'sun', Home: 'home',
  ShoppingCart: 'shopping-cart', Utensils: 'coffee', Repeat: 'repeat',
};

function resolveFeatherIcon(icon?: string | null, fallback = 'tag'): string {
  if (!icon) return fallback;
  if (ICON_MAP_MOBILE[icon]) return ICON_MAP_MOBILE[icon];
  return icon.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() || fallback;
}

import {
  Category,
  getCategories,
  deleteCategory,
} from '@/features/dashboard/services/category.service';
import { useAuth } from '@/features/auth/store/AuthContext';

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';

export default function CategoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');

  const fetchCategories = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getCategories(user.id);
      setCategories(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { fetchCategories(); }, [fetchCategories]));

  const filtered = useMemo(() => {
    return categories.filter(c => {
      const matchType = filterType === 'ALL' || c.type === filterType;
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [categories, filterType, search]);

  const goToNew = () => router.push('/(tabs)/new-category' as any);
  const goToEdit = (cat: Category) =>
    router.push({
      pathname: '/(tabs)/new-category' as any,
      params: {
        id: String(cat.id),
        name: cat.name,
        color: cat.color ?? '',
        icon: cat.icon ?? '',
        type: cat.type,
      },
    });

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Excluir categoria',
      `Deseja excluir "${cat.name}"?\nTransações vinculadas podem ser afetadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id, user!.id);
              setCategories(prev => prev.filter(c => c.id !== cat.id));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir. Pode haver transações vinculadas.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>

        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View>
            <Text style={styles.headerTitle}>Categorias</Text>
            <Text style={styles.headerSub}>{categories.length} categorias cadastradas</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={goToNew} activeOpacity={0.85}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Filtros ── */}
        <View style={styles.filtersRow}>
          <View style={styles.typePills}>
            {([['ALL', 'Todas'], ['INCOME', 'Receitas'], ['EXPENSE', 'Despesas']] as [FilterType, string][]).map(([val, label]) => (
              <TouchableOpacity
                key={val}
                onPress={() => setFilterType(val)}
                style={[styles.typePill, filterType === val && styles.typePillActive]}
              >
                <Text style={[styles.typePillText, filterType === val && styles.typePillTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Busca ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#a1a1aa" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar categoria..."
              placeholderTextColor="#a1a1aa"
              value={search}
              onChangeText={setSearch}
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
              <Feather name="tag" size={32} color="#d4d4d8" />
            </View>
            <Text style={styles.emptyTitle}>
              {search || filterType !== 'ALL' ? 'Nenhum resultado' : 'Nenhuma categoria'}
            </Text>
            <Text style={styles.emptySub}>
              {search || filterType !== 'ALL'
                ? 'Tente ajustar os filtros'
                : 'Toque no "+" para criar sua primeira categoria'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => {
              const typeColor = item.type === 'INCOME' ? '#10b981' : '#ef4444';
              const typeBg    = item.type === 'INCOME' ? '#d1fae5' : '#fee2e2';
              const typeLabel = item.type === 'INCOME' ? 'Receita' : 'Despesa';

              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => goToEdit(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color || '#10b981' }]}>
                    <Feather name={resolveFeatherIcon(item.icon) as any} size={18} color="#fff" />
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
                      <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
                    </View>
                  </View>

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
              );
            }}
          />
        )}
      </View>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, marginBottom: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#18181b' },
  headerSub:   { fontSize: 12, color: '#a1a1aa', fontWeight: '500', marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#10b981',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },

  filtersRow: { paddingHorizontal: 16, marginBottom: 8 },
  typePills: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#f4f4f5', gap: 2,
  },
  typePill: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  typePillActive: { backgroundColor: '#18181b' },
  typePillText: { fontSize: 11, fontWeight: '800', color: '#a1a1aa' },
  typePillTextActive: { color: '#fff' },

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
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 5 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#18181b' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  typeBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#18181b', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#a1a1aa', textAlign: 'center', lineHeight: 20 },
});
