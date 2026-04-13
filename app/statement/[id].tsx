import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuth } from '@/features/auth/store/AuthContext';
import { getStatements, updateStatementStatus, type Statement } from '@/features/dashboard/services/credit-card.service';
import { getTransactions, type Transaction } from '@/features/dashboard/services/transaction.service';
import { getCategories, type Category } from '@/features/dashboard/services/category.service';
import { getAccounts, type Account } from '@/features/dashboard/services/account.service';

const statusConfig = {
  OPEN:           { label: "Aberta",  bg: '#ecfdf5', text: '#059669', dot: '#10b981' },
  CLOSED:         { label: "Fechada", bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  PAID:           { label: "Paga",    bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  PARTIALLY_PAID: { label: "Parcial", bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
};

function KpiChip({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: string }) {
  return (
    <View style={[styles.kpiChip, highlight && styles.kpiChipHighlight]}>
      <Text style={[styles.kpiChipLabel, highlight && { color: 'rgba(255,255,255,0.5)' }]}>{label}</Text>
      <Text style={[styles.kpiChipValue, highlight && { color: '#fff' }]}>{value}</Text>
      {sub && <Text style={[styles.kpiChipSub, highlight && { color: 'rgba(255,255,255,0.5)' }]}>{sub}</Text>}
    </View>
  );
}

function TxRow({ tx, categories }: { tx: Transaction; categories: Category[] }) {
  const isExpense = tx.type.trim() === "EXPENSE";
  const category = categories.find(c => c.id === tx.categoryId);
  const label = tx.description || category?.name || (isExpense ? "Despesa" : "Receita");
  const dateStr = format(parseISO(tx.date), "dd/MM/yyyy");

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIconBox, { backgroundColor: category?.color || '#f4f4f5' }]}>
        <Feather name={isExpense ? 'tag' : 'trending-up'} size={18} color="#fff" />
      </View>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.txLabel} numberOfLines={1}>{label}</Text>
        {category && <Text style={styles.txCategory}>{category.name}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <View style={styles.txAmountRow}>
           <Feather name={isExpense ? "arrow-down-right" : "arrow-up-right"} size={14} color={isExpense ? "#f43f5e" : "#10b981"} />
           <Text style={[styles.txAmount, { color: isExpense ? '#18181b' : '#10b981' }]}>
             {isExpense ? "-" : "+"}R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </Text>
        </View>
        <Text style={styles.txDate}>{dateStr}</Text>
      </View>
    </View>
  );
}

export default function StatementDetailScreen() {
  const { id, cardId } = useLocalSearchParams<{ id: string; cardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [statement, setStatement] = useState<Statement | null>(null);
  const [card, setCard] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      if (!user || !id || !cardId) return;
      try {
        const [accs, stmts, txs, cats] = await Promise.all([
          getAccounts(user.id),
          getStatements(Number(cardId)),
          getTransactions(user.id),
          getCategories(user.id),
        ]);
        const foundStmt = stmts.find(s => s.id === Number(id));
        const foundCard = accs.find(a => a.id === Number(cardId));
        setStatement(foundStmt ?? null);
        setCard(foundCard ?? null);
        setTransactions(txs);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [id, cardId, user]);

  const statementTxs = useMemo(() => {
    if (!statement) return [];
    try {
      const start = parseISO(statement.startDate);
      const end = parseISO(statement.endDate);
      return transactions.filter(tx => {
        if (tx.accountId !== Number(cardId)) return false;
        const d = parseISO(tx.date);
        return isWithinInterval(d, { start, end });
      });
    } catch {
      return [];
    }
  }, [transactions, statement, cardId]);

  const totalExpenses = useMemo(() => statementTxs.filter(t => t.type.trim() === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0), [statementTxs]);
  const totalIncome = useMemo(() => statementTxs.filter(t => t.type.trim() === "INCOME").reduce((s, t) => s + Number(t.amount), 0), [statementTxs]);

  async function handlePay() {
    if (!statement || !card) return;
    setPaying(true);
    try {
      const updated = await updateStatementStatus(statement.id, card.id, "PAID");
      setStatement(updated);
      Alert.alert("Sucesso", "Fatura marcada como paga!");
    } catch {
      Alert.alert("Erro", "Falha ao atualizar o status da fatura.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!statement || !card) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Fatura não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
          <Text style={styles.backButtonInlineText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const normalizedStatus = statement.status?.trim() as keyof typeof statusConfig;
  const cfg = statusConfig[normalizedStatus] ?? statusConfig.OPEN;
  const canPay = statement.status?.trim() !== "PAID";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#52525b" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>
              Fatura de {format(parseISO(statement.dueDate), "MMM yyyy", { locale: ptBR })}
            </Text>
            <View style={[styles.stmtBadge, { backgroundColor: cfg.bg }]}>
              <View style={[styles.stmtBadgeDot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.stmtBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>
          <View style={styles.cardInfoRow}>
            <Feather name="credit-card" size={13} color="#a1a1aa" />
            <Text style={styles.cardInfoText}>{card.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Feather name="calendar" size={14} color="#a1a1aa" />
          <Text style={styles.bannerText}>
            De <Text style={styles.bannerStrong}>{format(parseISO(statement.startDate), "dd/MM")}</Text> a <Text style={styles.bannerStrong}>{format(parseISO(statement.endDate), "dd/MM")}</Text>
          </Text>
          <View style={styles.bannerDiv} />
          <Text style={styles.bannerText}>
            Vence: <Text style={styles.bannerStrong}>{format(parseISO(statement.dueDate), "dd/MM")}</Text>
          </Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KpiChip 
            label="Total da Fatura" 
            value={`R$ ${statement.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
            highlight 
          />
          <KpiChip 
            label="Despesas" 
            value={`R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
            sub={`${statementTxs.filter(t => t.type.trim() === "EXPENSE").length} txs`}
          />
        </View>

        {/* Transaction list */}
        <View style={styles.txBox}>
          <View style={styles.txBoxHeader}>
            <Text style={styles.txBoxTitle}>Lançamentos do Período</Text>
            <View style={styles.txCountBadge}>
              <Text style={styles.txCountText}>{statementTxs.length} items</Text>
            </View>
          </View>

          {statementTxs.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="trending-down" size={32} color="#e4e4e7" style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: '#18181b', fontWeight: 'bold' }]}>Nenhuma transação</Text>
              <Text style={[styles.emptyText, { marginTop: 4, fontSize: 11 }]}>
                Neste ciclo de faturamento.
              </Text>
            </View>
          ) : (
            <View>
              {statementTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                <TxRow key={tx.id} tx={tx} categories={categories} />
              ))}
            </View>
          )}
        </View>

        {!canPay && (
          <View style={styles.paidMessage}>
            <Feather name="check-circle" size={20} color="#1d4ed8" />
            <View>
              <Text style={styles.paidMessageTitle}>Fatura Paga</Text>
              <Text style={styles.paidMessageSub}>Esta fatura já foi liquidada.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Payment */}
      {canPay && (
        <View style={[styles.fabContainer, { paddingBottom: insets.bottom || 24 }]}>
          <TouchableOpacity 
            style={[styles.fab, paying && { opacity: 0.8 }]} 
            onPress={handlePay} 
            disabled={paying}
            activeOpacity={0.9}
          >
            {paying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.fabText}>Marcar como Paga</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonInline: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  backButtonInlineText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181b',
    textTransform: 'capitalize',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  stmtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  stmtBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  stmtBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderColor: '#f4f4f5',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a1a1aa',
  },
  bannerStrong: {
    fontWeight: '900',
    color: '#18181b',
  },
  bannerDiv: {
    width: 1,
    height: 12,
    backgroundColor: '#e4e4e7',
    marginHorizontal: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  kpiChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  kpiChipHighlight: {
    backgroundColor: '#18181b',
    borderColor: '#18181b',
  },
  kpiChipLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  kpiChipValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18181b',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  kpiChipSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#a1a1aa',
    marginTop: 4,
  },
  txBox: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    marginBottom: 20,
  },
  txBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  txBoxTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#52525b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  txCountBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  txCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#a1a1aa',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fafafa',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  txCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a1a1aa',
    marginTop: 2,
  },
  txAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  txDate: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  paidMessage: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paidMessageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  paidMessageSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
    marginTop: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(245,246,248,0.9)',
  },
  fab: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
