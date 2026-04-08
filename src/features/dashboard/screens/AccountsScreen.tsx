import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Account,
  AccountType,
  CreateAccountDTO,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/features/dashboard/services/account.service';
import { useAuth } from '@/features/auth/store/AuthContext';

// ─── Constantes de Identidade Visual ─────────────────────────────────────────

const ACCOUNT_COLORS: Record<AccountType, string> = {
  CHECKING: '#10b981',   // emerald — conta corrente
  INVESTMENT: '#6366f1', // indigo  — investimento
  CREDIT_CARD: '#f59e0b',// amber   — cartão de crédito
  CASH: '#3b82f6',       // blue    — dinheiro
};

const ACCOUNT_ICONS: Record<AccountType, string> = {
  CHECKING: 'landmark',
  INVESTMENT: 'trending-up',
  CREDIT_CARD: 'credit-card',
  CASH: 'dollar-sign',
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta Corrente',
  INVESTMENT: 'Investimento',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
};

const ACCOUNT_TYPES: AccountType[] = ['CHECKING', 'INVESTMENT', 'CREDIT_CARD', 'CASH'];

// ─── Formatação monetária ─────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// ─── Componente AccountCard ───────────────────────────────────────────────────

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
}) {
  const color = ACCOUNT_COLORS[account.type] ?? '#18181b';
  const icon = ACCOUNT_ICONS[account.type] ?? 'circle';

  return (
    <View style={[styles.accountCard, { backgroundColor: color }]}>
      {/* Círculo glassmorphism decorativo */}
      <View style={styles.cardCircle} />

      {/* Topo: tipo + ações */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardTypeBadge}>
          <Feather name={icon as any} size={12} color="rgba(255,255,255,0.9)" />
          <Text style={styles.cardTypeText}>{ACCOUNT_TYPE_LABELS[account.type]}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => onEdit(account)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
          >
            <Feather name="edit-2" size={14} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(account)}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
          >
            <Feather name="trash-2" size={14} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nome da conta */}
      <Text style={styles.cardName}>{account.name}</Text>

      {/* Saldo */}
      <Text style={styles.cardBalanceLabel}>Saldo atual</Text>
      <Text style={styles.cardBalance}>{formatCurrency(account.currentBalance)}</Text>

      {/* Badge ativo/inativo */}
      <View style={styles.cardStatusRow}>
        <View style={[styles.cardStatusDot, { backgroundColor: account.isActive ? '#fff' : 'rgba(255,255,255,0.4)' }]} />
        <Text style={styles.cardStatusText}>{account.isActive ? 'Ativa' : 'Inativa'}</Text>
      </View>
    </View>
  );
}

// ─── Modal de Criação / Edição ────────────────────────────────────────────────

interface AccountFormModalProps {
  visible: boolean;
  account: Account | null; // null = novo
  userId: number;
  onClose: () => void;
  onSaved: () => void;
}

function AccountFormModal({ visible, account, userId, onClose, onSaved }: AccountFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  // Preenche campos ao editar
  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(account.currentBalance.toString());
      setLimit(account.limitAmount?.toString() ?? '');
    } else {
      setName('');
      setType('CHECKING');
      setBalance('');
      setLimit('');
    }
  }, [account, visible]);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Campo obrigatório', 'Informe o nome da conta.');
    const balanceNum = parseFloat(balance.replace(',', '.'));
    if (isNaN(balanceNum)) return Alert.alert('Valor inválido', 'Informe o saldo inicial corretamente.');

    try {
      setSaving(true);
      const dto: CreateAccountDTO = {
        userId,
        name: name.trim(),
        type,
        initialBalance: account ? account.initialBalance : balanceNum,
        currentBalance: balanceNum,
        currencyCode: 'BRL',
        limitAmount: limit ? parseFloat(limit.replace(',', '.')) : null,
        isActive: true,
      };

      if (account) {
        await updateAccount(account.id, dto);
      } else {
        await createAccount(dto);
      }

      onSaved();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar a conta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={modalStyles.root}>
          {/* Header do modal */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{account ? 'Editar conta' : 'Nova conta'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color="#18181b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modalStyles.body} keyboardShouldPersistTaps="handled">
            {/* Nome */}
            <Text style={modalStyles.label}>Nome da conta</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Ex: Nubank, XP, Carteira..."
              placeholderTextColor="#a1a1aa"
              value={name}
              onChangeText={setName}
            />

            {/* Tipo de conta */}
            <Text style={modalStyles.label}>Tipo de conta</Text>
            <View style={modalStyles.typeGrid}>
              {ACCOUNT_TYPES.map((t) => {
                const active = type === t;
                const color = ACCOUNT_COLORS[t];
                return (
                  <TouchableOpacity
                    key={t}
                    style={[modalStyles.typeChip, active && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setType(t)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={ACCOUNT_ICONS[t] as any}
                      size={14}
                      color={active ? '#fff' : '#71717a'}
                    />
                    <Text style={[modalStyles.typeChipText, active && { color: '#fff' }]}>
                      {ACCOUNT_TYPE_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Saldo */}
            <Text style={modalStyles.label}>{account ? 'Saldo atual' : 'Saldo inicial'}</Text>
            <View style={modalStyles.inputWrapper}>
              <Text style={modalStyles.currencyPrefix}>R$</Text>
              <TextInput
                style={[modalStyles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                placeholder="0,00"
                placeholderTextColor="#a1a1aa"
                keyboardType="decimal-pad"
                value={balance}
                onChangeText={setBalance}
              />
            </View>

            {/* Limite (só para crédito) */}
            {type === 'CREDIT_CARD' && (
              <>
                <Text style={modalStyles.label}>Limite do cartão</Text>
                <View style={modalStyles.inputWrapper}>
                  <Text style={modalStyles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={[modalStyles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                    placeholder="0,00"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="decimal-pad"
                    value={limit}
                    onChangeText={setLimit}
                  />
                </View>
              </>
            )}

            {/* Botão salvar */}
            <TouchableOpacity
              style={[modalStyles.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={modalStyles.saveButtonText}>{account ? 'Salvar alterações' : 'Criar conta'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Tela Principal ───────────────────────────────────────────────────────────

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const fetchAccounts = useCallback(async (showRefresh = false) => {
    if (!user) return;
    try {
      showRefresh ? setRefreshing(true) : setLoading(true);
      const data = await getAccounts(user.id);
      setAccounts(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar suas contas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (account: Account) => {
    Alert.alert(
      'Excluir conta',
      `Tem certeza que deseja excluir "${account.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(account.id, user!.id);
              fetchAccounts();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a conta.');
            }
          },
        },
      ]
    );
  };

  const totalBalance = accounts
    .filter((a) => a.isActive && a.type !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalCreditUsed = accounts
    .filter((a) => a.isActive && a.type === 'CREDIT_CARD')
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header da tela ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>MINHAS CONTAS</Text>
          <Text style={styles.headerTitle}>Gerenciar</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { setEditingAccount(null); setModalVisible(true); }}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAccounts(true)}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
      >
        {/* ── Cards de KPI ── */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: '#10b981' }]}>
            <View style={styles.kpiCircle} />
            <Feather name="trending-up" size={17} color="rgba(255,255,255,0.7)" />
            <Text style={styles.kpiLabel}>SALDO TOTAL</Text>
            <Text style={styles.kpiValue}>{formatCurrency(totalBalance)}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#f59e0b' }]}>
            <View style={styles.kpiCircle} />
            <Feather name="credit-card" size={17} color="rgba(255,255,255,0.7)" />
            <Text style={styles.kpiLabel}>CRÉDITO USADO</Text>
            <Text style={styles.kpiValue}>{formatCurrency(totalCreditUsed)}</Text>
          </View>
        </View>

        {/* ── Lista de contas ── */}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Feather name="inbox" size={32} color="#a1a1aa" />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma conta ainda</Text>
            <Text style={styles.emptySubtitle}>Adicione sua primeira conta para começar a controlar suas finanças.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => { setEditingAccount(null); setModalVisible(true); }}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.emptyButtonText}>Adicionar conta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'} cadastradas
            </Text>
            <View style={styles.accountList}>
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Modal ── */}
      <AccountFormModal
        visible={modalVisible}
        account={editingAccount}
        userId={user?.id ?? 0}
        onClose={() => setModalVisible(false)}
        onSaved={() => { setModalVisible(false); fetchAccounts(); }}
      />
    </View>
  );
}

// ─── Estilos Principais ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#a1a1aa',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 2,
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

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  /* KPI */
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    gap: 6,
  },
  kpiCircle: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },

  /* Seção */
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    letterSpacing: 0.3,
    marginTop: 4,
  },

  /* Lista */
  accountList: { gap: 14 },

  /* Account Card */
  accountCard: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  cardTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 14,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  cardBalanceLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBalance: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  cardStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },

  /* Empty state */
  centerState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: '#10b981',
    borderRadius: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

// ─── Estilos do Modal ─────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
  },
  body: {
    padding: 24,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27272a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#18181b',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginRight: 6,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  saveButton: {
    height: 44,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
