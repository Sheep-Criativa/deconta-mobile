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
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/features/dashboard/services/category.service';
import { useAuth } from '@/features/auth/store/AuthContext';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  '#10b981', '#ef4444', '#6366f1', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
  '#64748b', '#e11d48',
];

const CATEGORY_ICONS = [
  'home', 'shopping-bag', 'heart', 'music', 'book',
  'briefcase', 'tool', 'gift', 'coffee', 'zap',
  'truck', 'film', 'globe', 'award', 'anchor',
  'tag', 'dollar-sign', 'bar-chart-2', 'cpu', 'sun',
];

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';

// ─── Modal de Criação/Edição ──────────────────────────────────────────────────

interface CategoryModalProps {
  visible: boolean;
  categoryToEdit: Category | null;
  onClose: () => void;
  onSave: (data: { name: string; color: string; icon: string; type: 'INCOME' | 'EXPENSE' }) => Promise<void>;
  saving: boolean;
}

function CategoryModal({ visible, categoryToEdit, onClose, onSave, saving }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [nameError, setNameError] = useState('');

  // Sync com categoria em edição
  React.useEffect(() => {
    if (visible) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setColor(categoryToEdit.color || CATEGORY_COLORS[0]);
        setIcon(categoryToEdit.icon || CATEGORY_ICONS[0]);
        setType(categoryToEdit.type);
      } else {
        setName('');
        setColor(CATEGORY_COLORS[0]);
        setIcon(CATEGORY_ICONS[0]);
        setType('EXPENSE');
      }
      setNameError('');
    }
  }, [visible, categoryToEdit]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('Nome deve ter ao menos 2 caracteres');
      return;
    }
    setNameError('');
    await onSave({ name: trimmed, color, icon, type });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop clicável para fechar */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Sheet em cima do backdrop */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {/* Preview */}
            <View style={styles.previewContainer}>
              <View style={[styles.previewIcon, { backgroundColor: color }]}>
                <Feather name={icon as any} size={28} color="#fff" />
              </View>
              <Text style={styles.previewName} numberOfLines={1}>{name || 'Nome da categoria'}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Nome */}
              <Text style={styles.modalLabel}>Nome</Text>
              <TextInput
                style={[styles.modalInput, nameError ? styles.inputError : null]}
                placeholder="Ex: Alimentação, Salário..."
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={t => { setName(t); setNameError(''); }}
                maxLength={100}
              />
              {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

              {/* Tipo */}
              <Text style={styles.modalLabel}>Tipo</Text>
              <View style={styles.typeRow}>
                {([['INCOME', 'Receita', '#10b981'], ['EXPENSE', 'Despesa', '#ef4444']] as const).map(([val, label, clr]) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setType(val)}
                    style={[styles.typeChip, type === val && { backgroundColor: clr, borderColor: clr }]}
                  >
                    <Text style={[styles.typeChipText, type === val && { color: '#fff' }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cor */}
              <Text style={styles.modalLabel}>Cor</Text>
              <View style={styles.colorsGrid}>
                {CATEGORY_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorSelected]}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <Feather name="check" size={16} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ícone */}
              <Text style={styles.modalLabel}>Ícone</Text>
              <View style={styles.iconsGrid}>
                {CATEGORY_ICONS.map(ic => (
                  <TouchableOpacity
                    key={ic}
                    style={[styles.iconOption, icon === ic && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setIcon(ic)}
                  >
                    <Feather name={ic as any} size={20} color={icon === ic ? '#fff' : '#71717a'} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Salvar */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>{categoryToEdit ? 'Salvar alterações' : 'Criar categoria'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Tela Principal ───────────────────────────────────────────────────────────

export default function CategoriesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

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

  const incomeCount  = useMemo(() => categories.filter(c => c.type === 'INCOME').length, [categories]);
  const expenseCount = useMemo(() => categories.filter(c => c.type === 'EXPENSE').length, [categories]);

  const openCreate = () => { setEditingCategory(null); setModalVisible(true); };
  const openEdit = (cat: Category) => { setEditingCategory(cat); setModalVisible(true); };

  const handleSave = async (data: { name: string; color: string; icon: string; type: 'INCOME' | 'EXPENSE' }) => {
    if (!user?.id) return;
    try {
      setSaving(true);
      if (editingCategory) {
        const dto: UpdateCategoryDTO = { name: data.name, color: data.color, icon: data.icon, type: data.type };
        const updated = await updateCategory(editingCategory.id, dto);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const dto: CreateCategoryDTO = { userId: user.id, ...data };
        const created = await createCategory(dto);
        setCategories(prev => [created, ...prev]);
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

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
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Categorias</Text>
            <Text style={styles.headerSub}>{categories.length} categorias cadastradas</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
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
                  onPress={() => openEdit(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color || '#10b981' }]}>
                    <Feather name={(item.icon as any) || 'tag'} size={18} color="#fff" />
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
                      onPress={() => openEdit(item)}
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

      <CategoryModal
        visible={modalVisible}
        categoryToEdit={editingCategory}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, marginBottom: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#18181b' },
  headerSub:   { fontSize: 12, color: '#a1a1aa', fontWeight: '500', marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#10b981',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },

  // KPIs
  kpiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  kpiCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  kpiValue: { fontSize: 22, fontWeight: '900' },
  kpiLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Filtros
  filtersRow: { paddingHorizontal: 16, marginBottom: 8 },
  typePills: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#f4f4f5', gap: 2,
  },
  typePill: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  typePillActive: { backgroundColor: '#18181b' },
  typePillText: { fontSize: 11, fontWeight: '800', color: '#a1a1aa' },
  typePillTextActive: { color: '#fff' },

  // Busca
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 44,
    borderWidth: 1, borderColor: '#f4f4f5',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#18181b', fontWeight: '600' },

  // Lista
  list: { paddingHorizontal: 16, paddingBottom: 40 },

  // Card
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

  // Empty
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#18181b', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#a1a1aa', textAlign: 'center', lineHeight: 20 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e4e4e7', borderRadius: 999, alignSelf: 'center', marginBottom: 16 },
  previewContainer: { alignItems: 'center', paddingVertical: 20 },
  previewIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  previewName: { fontSize: 18, fontWeight: '700', color: '#18181b' },
  modalLabel: { fontSize: 13, fontWeight: '700', color: '#27272a', marginTop: 16, marginBottom: 8 },
  modalInput: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e4e4e7',
    backgroundColor: '#fafafa', paddingHorizontal: 14, fontSize: 15, color: '#18181b',
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#e4e4e7',
    backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center',
  },
  typeChipText: { fontSize: 14, fontWeight: '700', color: '#71717a' },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOption: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: {
    width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f4f4f5', borderWidth: 1.5, borderColor: '#e4e4e7',
  },
  saveBtn: {
    height: 52, backgroundColor: '#6366f1', borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginTop: 28, marginBottom: 8,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
