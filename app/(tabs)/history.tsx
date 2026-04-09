import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/store/AuthContext';
import { getTransactions, deleteTransaction, Transaction } from '@/features/dashboard/services/transaction.service';
import { getAccounts, Account } from '@/features/dashboard/services/account.service';
import { getCategories, Category } from '@/features/dashboard/services/category.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr.split('T')[0] + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
};

const formatMonthYear = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);

const isSameMonth = (dateStr: string, ref: Date) => {
  const d = new Date(dateStr.split('T')[0] + 'T12:00:00');
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
};

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  }).format(d);
}

function groupByDate(txs: Transaction[]): [string, Transaction[]][] {
  const map: Record<string, Transaction[]> = {};
  txs.forEach(tx => {
    const day = tx.date.split('T')[0];
    if (!map[day]) map[day] = [];
    map[day].push(tx);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

const TYPE_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  INCOME:   { color: '#059669', bg: '#d1fae5', icon: 'arrow-up' },
  EXPENSE:  { color: '#e11d48', bg: '#fee2e2', icon: 'arrow-down' },
  TRANSFER: { color: '#6366f1', bg: '#e0e7ff', icon: 'repeat' },
  ADJUSTMENT: { color: '#f59e0b', bg: '#fef3c7', icon: 'sliders' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED:  { label: 'Confirmado', color: '#047857', bg: '#d1fae5' },
  PENDING:    { label: 'Pendente',   color: '#92400e', bg: '#fef3c7' },
  RECONCILED: { label: 'Conciliado', color: '#1d4ed8', bg: '#dbeafe' },
};

// ─── Componente: TransactionRow ───────────────────────────────────────────────

function TransactionRow({
  tx,
  accounts,
  categories,
  onLongPress,
}: {
  tx: Transaction;
  accounts: Account[];
  categories: Category[];
  onLongPress: (tx: Transaction) => void;
}) {
  const cfg = TYPE_COLORS[tx.type] ?? TYPE_COLORS.EXPENSE;
  const cat = categories.find(c => c.id === tx.categoryId);
  const acc = accounts.find(a => a.id === tx.accountId);
  const status = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.CONFIRMED;
  const isExpense = tx.type === 'EXPENSE';

  const iconColor = cat?.color || cfg.color;
  const iconBg = (cat?.color || cfg.color) + '1A';

  return (
    <TouchableOpacity
      style={styles.txRow}
      onLongPress={() => onLongPress(tx)}
      activeOpacity={0.7}
    >
      <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
        <Feather name={cfg.icon as any} size={16} color={iconColor} />
      </View>

      <View style={styles.txMiddle}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {tx.description || cat?.name || (isExpense ? 'Despesa' : 'Receita')}
        </Text>
        <View style={styles.txMeta}>
          {acc && <Text style={styles.txMetaText}>{acc.name}</Text>}
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.txAmount, { color: isExpense ? '#18181b' : '#059669' }]}>
        {isExpense ? '–' : '+'}{formatCurrency(Number(tx.amount))}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Componente: DayGroup ─────────────────────────────────────────────────────

function DayGroup({
  dateStr,
  txs,
  accounts,
  categories,
  onLongPress,
}: {
  dateStr: string;
  txs: Transaction[];
  accounts: Account[];
  categories: Category[];
  onLongPress: (tx: Transaction) => void;
}) {
  const dayTotal = txs.reduce((sum, tx) => {
    return tx.type === 'INCOME' ? sum + Number(tx.amount) : sum - Number(tx.amount);
  }, 0);

  return (
    <View style={styles.dayGroup}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{formatDayLabel(dateStr)}</Text>
        <Text style={[styles.dayTotal, { color: dayTotal >= 0 ? '#059669' : '#e11d48' }]}>
          {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
        </Text>
      </View>

      <View style={styles.dayCard}>
        {txs.map((tx, idx) => (
          <View key={tx.id}>
            <TransactionRow
              tx={tx}
              accounts={accounts}
              categories={categories}
              onLongPress={onLongPress}
            />
            {idx < txs.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Componente: MonthlySummary ───────────────────────────────────────────────

function MonthlySummary({ txs }: { txs: Transaction[] }) {
  const income  = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Receitas</Text>
        <Text style={[styles.summaryValue, { color: '#059669' }]}>{formatCurrency(income)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Despesas</Text>
        <Text style={[styles.summaryValue, { color: '#e11d48' }]}>{formatCurrency(expense)}</Text>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: balance >= 0 ? '#d1fae5' : '#fee2e2', borderColor: balance >= 0 ? '#a7f3d0' : '#fecaca' }]}>
        <Text style={styles.summaryLabel}>Saldo</Text>
        <Text style={[styles.summaryValue, { color: balance >= 0 ? '#047857' : '#be123c' }]}>
          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
        </Text>
      </View>
    </View>
  );
}

// ─── Tipos de filtro ──────────────────────────────────────────────────────────

type TypeFilter = '' | 'INCOME' | 'EXPENSE';

// ─── Tela Principal ───────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [txData, accData, catData] = await Promise.all([
        getTransactions(user.id).catch(() => []),
        getAccounts(user.id).catch(() => []),
        getCategories(user.id).catch(() => []),
      ]);
      setTransactions(txData);
      setAccounts(accData);
      setCategories(catData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const canGoNext = useMemo(() => {
    const now = new Date();
    return !(currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear());
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (!isSameMonth(tx.date, currentMonth)) return false;
      if (typeFilter && tx.type !== typeFilter) return false;
      if (searchText) {
        const cat = categories.find(c => c.id === tx.categoryId);
        const acc = accounts.find(a => a.id === tx.accountId);
        const search = searchText.toLowerCase();
        const matchDesc = tx.description?.toLowerCase().includes(search);
        const matchCat  = cat?.name.toLowerCase().includes(search);
        const matchAcc  = acc?.name.toLowerCase().includes(search);
        if (!matchDesc && !matchCat && !matchAcc) return false;
      }
      return true;
    });
  }, [transactions, currentMonth, typeFilter, searchText, categories, accounts]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleLongPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowActionSheet(true);
  };

  const handleDelete = async () => {
    if (!selectedTx || !user?.id) return;
    setShowActionSheet(false);
    Alert.alert(
      'Excluir transação?',
      `${selectedTx.description || 'Sem descrição'} · ${formatCurrency(Number(selectedTx.amount))}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(selectedTx.id, user.id);
              setTransactions(prev => prev.filter(t => t.id !== selectedTx.id));
              setSelectedTx(null);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a transação.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Navegação de mês ── */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
          <Feather name="chevron-left" size={20} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity onPress={nextMonth} style={[styles.monthBtn, !canGoNext && { opacity: 0.3 }]} disabled={!canGoNext}>
          <Feather name="chevron-right" size={20} color="#18181b" />
        </TouchableOpacity>
      </View>

      {/* ── KPIs ── */}
      <MonthlySummary txs={filtered} />

      {/* ── Filtros + Busca ── */}
      <View style={styles.filtersSection}>
        <View style={styles.typeFilterRow}>
          <View style={styles.typePills}>
            {([['', 'Todos'], ['INCOME', 'Receitas'], ['EXPENSE', 'Despesas']] as [TypeFilter, string][]).map(([val, label]) => (
              <TouchableOpacity
                key={val}
                onPress={() => setTypeFilter(val)}
                style={[styles.typePill, typeFilter === val && styles.typePillActive]}
              >
                <Text style={[styles.typePillText, typeFilter === val && styles.typePillTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => { setShowSearch(s => !s); if (showSearch) setSearchText(''); }}
            style={[styles.searchToggle, showSearch && { backgroundColor: '#18181b' }]}
          >
            <Feather name={showSearch ? 'x' : 'search'} size={16} color={showSearch ? '#fff' : '#71717a'} />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descrição, categoria..."
            placeholderTextColor="#a1a1aa"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        )}
      </View>

      {/* ── Lista ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#10b981" />}
      >
        {grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#e4e4e7" />
            <Text style={styles.emptyTitle}>Nenhuma transação</Text>
            <Text style={styles.emptySubtitle}>
              {typeFilter || searchText ? 'Tente ajustar os filtros' : 'Use o botão + para adicionar'}
            </Text>
          </View>
        ) : (
          grouped.map(([dateStr, txs]) => (
            <DayGroup
              key={dateStr}
              dateStr={dateStr}
              txs={txs}
              accounts={accounts}
              categories={categories}
              onLongPress={handleLongPress}
            />
          ))
        )}
      </ScrollView>

      {/* ── Action Sheet (long press) ── */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowActionSheet(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />

            {selectedTx && (
              <View style={styles.actionSheetTx}>
                <Text style={styles.actionSheetDesc} numberOfLines={1}>
                  {selectedTx.description || 'Sem descrição'}
                </Text>
                <Text style={styles.actionSheetAmount}>
                  {formatCurrency(Number(selectedTx.amount))} · {formatDate(selectedTx.date)}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Feather name="trash-2" size={18} color="#e11d48" />
              <Text style={[styles.actionBtnText, { color: '#e11d48' }]}>Excluir transação</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnCancel]} onPress={() => setShowActionSheet(false)}>
              <Text style={styles.actionBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  // Month Nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f5',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18181b',
    textTransform: 'capitalize',
  },

  // Summary KPIs
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
    color: '#18181b',
  },

  // Filters
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  typeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePills: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    gap: 2,
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  typePillActive: {
    backgroundColor: '#18181b',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a1a1aa',
  },
  typePillTextActive: {
    color: '#ffffff',
  },
  searchToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '600',
    color: '#18181b',
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // Day Group
  dayGroup: {
    gap: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a1a1aa',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  dayTotal: {
    fontSize: 11,
    fontWeight: '900',
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  divider: {
    height: 1,
    backgroundColor: '#fafafa',
    marginHorizontal: 16,
  },

  // Transaction Row
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txMiddle: {
    flex: 1,
    gap: 4,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txMetaText: {
    fontSize: 10,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
    flexShrink: 0,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '500',
  },

  // Action Sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 4,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e4e4e7',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetTx: {
    backgroundColor: '#f4f4f5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  actionSheetDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  actionSheetAmount: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnCancel: {
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#71717a',
    textAlign: 'center',
    flex: 1,
  },
});