import React, { useState, useEffect, useCallback } from 'react';
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

import { Category, getCategories, deleteCategory } from '@/features/dashboard/services/category.service';
import { useAuth } from '@/features/auth/store/AuthContext';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    console.log('[DEBUG categories] user:', user);
    console.log('[DEBUG categories] userId:', user?.id);
    if (!user) {
      console.log('[DEBUG categories] Retornando - user não disponível');
      return;
    }
    try {
      setLoading(true);
      console.log('[DEBUG categories] Chamando getCategories com userId:', user.id);
      const data = await getCategories(user.id);
      console.log('[DEBUG categories] Resposta da API:', JSON.stringify(data));
      setCategories(data);
    } catch (err: any) {
      console.error('[DEBUG categories] Erro ao buscar categorias:', err?.response?.data || err?.message);
      Alert.alert('Erro', 'Não foi possível carregar as categorias.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Excluir categoria',
      `Deseja excluir "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id, user!.id);
              setCategories((prev) => prev.filter((c) => c.id !== category.id));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a categoria.');
            }
          },
        },
      ]
    );
  };

  console.log(user);

  const getTypeLabel = (type: 'INCOME' | 'EXPENSE') =>
    type === 'INCOME' ? 'Receita' : 'Despesa';

  const getTypeColor = (type: 'INCOME' | 'EXPENSE') =>
    type === 'INCOME' ? '#10b981' : '#ef4444';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Categorias',
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
              placeholder="Buscar categoria..."
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
            onPress={() => router.push('/(tabs)/new-category' as any)}
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
              <Feather name="tag" size={32} color="#a1a1aa" />
            </View>
            <Text style={styles.emptyTitle}>
              {search.length > 0 ? 'Nenhum resultado' : 'Nenhuma categoria'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search.length > 0
                ? 'Tente outro termo de busca'
                : 'Toque no "+" para criar sua primeira categoria'}
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
                {/* Color dot / icon */}
                <View style={[styles.iconBox, { backgroundColor: item.color ?? '#10b981' }]}>
                  <Feather
                    name={(item.icon as any) ?? 'tag'}
                    size={18}
                    color="#ffffff"
                  />
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '18' }]}>
                    <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
                      {getTypeLabel(item.type)}
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#18181b',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  typeBadgeText: {
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
