import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/store/AuthContext';
import { Account, getAccounts } from '@/features/dashboard/services/account.service';
import { Transaction, getTransactions } from '@/features/dashboard/services/transaction.service';
import { Statement, getStatements } from '@/features/dashboard/services/credit-card.service';
import { Category, getCategories } from '@/features/dashboard/services/category.service';

const ACCOUNT_COLORS: Record<string, string> = {
  CHECKING: '#10b981',
  INVESTMENT: '#6366f1',
  CREDIT_CARD: '#f59e0b',
  CASH: '#3b82f6',
};

const ACCOUNT_LABELS: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  INVESTMENT: 'Investimento',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
};

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
};

export default function DashboardHomeScreen() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statements, setStatements] = useState<{accountId: number, statements: Statement[]}[]>([]);
  
  const [accountTab, setAccountTab] = useState<'contas' | 'credito'>('contas');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [accData, txData, catData] = await Promise.all([
        getAccounts(user.id).catch(() => []),
        getTransactions(user.id).catch(() => []),
        getCategories(user.id).catch(() => [])
      ]);

      setAccounts(accData);
      setTransactions(txData);
      setCategories(catData);

      // Faturas de cartão de crédito
      const creditCards = accData.filter(a => a.type === 'CREDIT_CARD' && a.isActive);
      const statementsPromises = creditCards.map(cc => 
        getStatements(cc.id)
          .then(stmts => ({ accountId: cc.id, statements: stmts }))
          .catch(() => ({ accountId: cc.id, statements: [] }))
      );
      
      const statementsResults = await Promise.all(statementsPromises);
      setStatements(statementsResults);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nonCcAccounts = useMemo(() => accounts.filter(a => a.type !== 'CREDIT_CARD' && a.isActive), [accounts]);
  const ccAccounts = useMemo(() => accounts.filter(a => a.type === 'CREDIT_CARD' && a.isActive), [accounts]);

  // KPIs
  const totalBalance = accounts
    .filter(a => a.isActive && a.type !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + Number(a.currentBalance), 0);

  const ccUsed = accounts
    .filter(a => a.isActive && a.type === 'CREDIT_CARD')
    .reduce((sum, a) => sum + Math.abs(Number(a.currentBalance)), 0);

  const livre = totalBalance - ccUsed;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };
  const isPrevMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  };

  const currentTxs = transactions.filter(t => t.status !== 'PENDING' && isCurrentMonth(t.date));
  const prevTxs = transactions.filter(t => t.status !== 'PENDING' && isPrevMonth(t.date));

  const monthIncome = currentTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const monthExpense = currentTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  
  const prevIncome = prevTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const prevExpense = prevTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);

  const incomeTrend = prevIncome > 0 ? ((monthIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseTrend = prevExpense > 0 ? ((monthExpense - prevExpense) / prevExpense) * 100 : 0;

  const recentTxs = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const openStatements = useMemo(() => {
    const open: {accountName: string, statement: Statement}[] = [];
    statements.forEach(res => {
      const acc = accounts.find(a => a.id === res.accountId);
      const op = res.statements.find(s => s.status === 'OPEN');
      if (op && acc) {
        open.push({ accountName: acc.name, statement: op });
      }
    });
    return open;
  }, [statements, accounts]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#10b981" />
      }
    >
      <View style={styles.kpiStack}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Geral</Text>
          <Text style={styles.balanceValue}>{formatCurrency(totalBalance)}</Text>
        </View>

        <View style={styles.rowKpi}>
          <View style={[styles.baseCard, styles.kpiHalfCard]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>Receitas</Text>
              <Feather name="arrow-up-circle" size={16} color="#10b981" />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(monthIncome)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              {incomeTrend !== 0 && (
                <Feather name={incomeTrend > 0 ? 'arrow-up-right' : 'arrow-down-right'} size={12} color={incomeTrend >= 0 ? '#10b981' : '#f43f5e'} />
              )}
              <Text style={[styles.kpiTrend, { color: incomeTrend >= 0 ? '#10b981' : '#f43f5e' }]}>
                {incomeTrend === 0 ? 'Mensal' : `${Math.abs(incomeTrend).toFixed(1)}%`}
              </Text>
            </View>
          </View>

          <View style={[styles.baseCard, styles.kpiHalfCard]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>Despesas</Text>
              <Feather name="arrow-down-circle" size={16} color="#f43f5e" />
            </View>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(monthExpense)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              {expenseTrend !== 0 && (
                <Feather name={expenseTrend > 0 ? 'arrow-up-right' : 'arrow-down-right'} size={12} color={expenseTrend >= 0 ? '#f43f5e' : '#10b981'} />
              )}
              <Text style={[styles.kpiTrend, { color: expenseTrend > 0 ? '#f43f5e' : '#10b981' }]}>
                {expenseTrend === 0 ? 'Mensal' : `${Math.abs(expenseTrend).toFixed(1)}%`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.mainStack}>
        <View style={styles.baseCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suas Contas</Text>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, accountTab === 'contas' && styles.tabBtnActive]}
                onClick={() => setAccountTab('contas')}
                onPress={() => setAccountTab('contas')}
              >
                <Text style={[styles.tabBtnText, accountTab === 'contas' && styles.tabBtnTextActive]}>
                  Contas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, accountTab === 'credito' && styles.tabBtnActive]}
                onClick={() => setAccountTab('credito')}
                onPress={() => setAccountTab('credito')}
              >
                <Text style={[styles.tabBtnText, accountTab === 'credito' && styles.tabBtnTextActive]}>
                  Crédito
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {accountTab === 'contas' ? (
            nonCcAccounts.length === 0 ? (
              <Text style={{color: '#a1a1aa', fontSize: 13}}>Nenhuma conta ativa.</Text>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
              >
                {nonCcAccounts.map(acc => (
                  <View key={acc.id} style={[styles.accountCard, { backgroundColor: ACCOUNT_COLORS[acc.type] || '#18181b' }]}>
                    <Text style={styles.accountType}>{ACCOUNT_LABELS[acc.type] || 'Outros'}</Text>
                    <Text style={styles.accountName} numberOfLines={1}>{acc.name}</Text>
                    <Text style={styles.accountLabelSmall}>Saldo disponível</Text>
                    <Text style={styles.accountBalance} numberOfLines={1}>{formatCurrency(Number(acc.currentBalance))}</Text>
                  </View>
                ))}
              </ScrollView>
            )
          ) : (
            ccAccounts.length === 0 ? (
              <Text style={{color: '#a1a1aa', fontSize: 13}}>Nenhum cartão cadastrado.</Text>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
              >
                {ccAccounts.map(acc => {
                  const limit = Number(acc.limitAmount || 0);
                  const used = Math.abs(Number(acc.currentBalance || 0));
                  const availableLimit = Math.max(0, limit - used);
                  
                  return (
                    <View key={acc.id} style={[styles.accountCard, { backgroundColor: '#18181b' }]}>
                      <Text style={[styles.accountType, { opacity: 0.5 }]}>Cartão de Crédito</Text>
                      <Text style={styles.accountName} numberOfLines={1}>{acc.name}</Text>
                      <Text style={[styles.accountLabelSmall, { opacity: 0.5 }]}>Limite disponível</Text>
                      <Text style={[styles.accountBalance, { color: '#34d399' }]} numberOfLines={1}>
                        {formatCurrency(availableLimit)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            )
          )}
        </View>

        {openStatements.length > 0 && (
          <View style={styles.baseCard}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.iconBox}>
                  <Feather name="credit-card" size={14} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Faturas Abertas</Text>
              </View>
            </View>

            {openStatements.map((item, index) => (
              <View key={index} style={[styles.invoiceItem, index > 0 && { marginTop: 8 }]}>
                <View>
                  <Text style={styles.invoiceName}>{item.accountName}</Text>
                  <Text style={styles.invoiceDue}>Vence {formatDate(item.statement.dueDate)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invoiceAmount}>{formatCurrency(Number(item.statement.totalAmount))}</Text>
                  <Text style={styles.invoiceStatus}>Aberta</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.baseCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.iconBox}>
                <Feather name="list" size={14} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Últimas Transações</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.linkText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recentTxs.length === 0 ? (
            <Text style={{color: '#a1a1aa', fontSize: 13}}>Nenhuma transação recente.</Text>
          ) : (
            recentTxs.map(tx => {
              const isIncome = tx.type === 'INCOME';
              const isExpense = tx.type === 'EXPENSE';
              const cat = categories.find(c => c.id === tx.categoryId);
              
              const color = cat?.color || (isIncome ? '#059669' : (isExpense ? '#e11d48' : '#6366f1'));
              const bgColor = (cat?.color || (isIncome ? '#10b981' : (isExpense ? '#f43f5e' : '#6366f1'))) + '1A'; // 10% opacity
              
              // O banco traz icones do lucide-react (Ex: "Wallet", "Home", "Heart")
              // Precisamos mapear os divergentes e converter o resto para kebab-case do Feather
              const mappedIcons: Record<string, string> = {
                'Wallet': 'briefcase',
                'Landmark': 'home',
                'GraduationCap': 'book',
                'Plane': 'navigation',
                'Car': 'truck'
              };
              
              let featherIcon = isIncome ? 'arrow-up' : (isExpense ? 'arrow-down' : 'repeat');
              
              if (cat?.icon) {
                if (mappedIcons[cat.icon]) {
                  featherIcon = mappedIcons[cat.icon];
                } else {
                  featherIcon = cat.icon.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                }
              }

              return (
                <TouchableOpacity key={tx.id} style={styles.txRow}>
                  <View style={[styles.txIconBox, { backgroundColor: bgColor }]}>
                    <Feather name={featherIcon as any} size={16} color={color} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.description || cat?.name || (isExpense ? 'Despesa' : 'Receita')}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                  </View>
                  <Text style={[styles.txValue, { color }]}>
                    {isExpense ? '-' : '+'}{formatCurrency(Number(tx.amount))}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiStack: {
    gap: 12,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: '#18181b', // zinc-900
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  balanceLabel: {
    color: '#a1a1aa',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  balanceSub: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  rowKpi: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiHalfCard: {
    flex: 1,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#a1a1aa',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
  },
  kpiTrend: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainStack: {
    gap: 20,
  },
  baseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  linkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    borderRadius: 999,
    padding: 2,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  tabBtnTextActive: {
    color: '#18181b',
  },
  accountCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  accountType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  accountName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  accountLabelSmall: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
  },
  accountBalance: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 16,
  },
  invoiceName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#18181b',
  },
  invoiceDue: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '600',
    marginTop: 2,
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#047857',
  },
  invoiceStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  txDate: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '600',
    marginTop: 2,
  },
  txValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#18181b',
  },
});
