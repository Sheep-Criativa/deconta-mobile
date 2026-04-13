import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccounts, type Account } from '@/features/dashboard/services/account.service';
import { getStatements, type Statement } from '@/features/dashboard/services/credit-card.service';
import { useAuth } from '@/features/auth/store/AuthContext';
import { CreditCardVisual } from '@/features/dashboard/components/CreditCardVisual';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  OPEN:           { label: "Aberta",   bg: '#ecfdf5', text: '#059669', dot: '#10b981' },
  CLOSED:         { label: "Fechada",  bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  PAID:           { label: "Paga",     bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  PARTIALLY_PAID: { label: "Parcial",  bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
};

function StatementCard({ statement, accountId, onPress }: { statement: Statement; accountId: number; onPress: () => void }) {
  const normalizedStatus = statement.status?.trim() as keyof typeof statusConfig;
  const cfg = statusConfig[normalizedStatus] ?? statusConfig.OPEN;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.stmtCard}>
      <View style={styles.stmtHeader}>
        <View style={[styles.stmtIconBox, { backgroundColor: cfg.bg }]}>
          <Feather name="credit-card" size={18} color={cfg.text} />
        </View>
        <View style={[styles.stmtBadge, { backgroundColor: cfg.bg }]}>
          <View style={[styles.stmtBadgeDot, { backgroundColor: cfg.dot }]} />
          <Text style={[styles.stmtBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      <Text style={styles.stmtMonth}>
        {format(parseISO(statement.dueDate), "MMM yyyy", { locale: ptBR })}
      </Text>
      <Text style={styles.stmtAmount}>
        R$ {Number(statement.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </Text>
      <Text style={styles.stmtDate}>
        Vence em {format(parseISO(statement.dueDate), "dd/MM")}
      </Text>
    </TouchableOpacity>
  );
}

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [account, setAccount] = useState<Account | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      try {
        const [accs, stmts] = await Promise.all([
          getAccounts(user.id),
          getStatements(Number(id)),
        ]);
        const matched = accs.find(a => a.id === Number(id));
        setAccount(matched || null);
        setStatements(stmts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Cartão não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
          <Text style={styles.backButtonInlineText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const upcomingStmts = statements.filter(s => s.status.trim() !== "PAID").slice(0, 3);
  const paidStmts = statements.filter(s => s.status.trim() === "PAID");
  const usedAmount = statements.filter(s => s.status.trim() !== "PAID").reduce((sum, s) => sum + Number(s.totalAmount ?? 0), 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#52525b" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Visualizando Cartão</Text>
          <Text style={styles.headerTitle}>{account.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <CreditCardVisual 
          account={account} 
          usedAmount={usedAmount}
          onEdit={() => {}} 
          onDelete={() => {}} 
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Faturas</Text>
          {upcomingStmts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma fatura pendente.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {upcomingStmts.map(s => (
                <StatementCard 
                  key={s.id} 
                  statement={s} 
                  accountId={account.id} 
                  onPress={() => router.push({ pathname: '/statement/[id]', params: { id: s.id, cardId: account.id } })}
                />
              ))}
            </View>
          )}
        </View>

        {paidStmts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#a1a1aa' }]}>Faturas Pagas</Text>
            <View style={styles.list}>
              {paidStmts.map(s => (
                <StatementCard 
                  key={s.id} 
                  statement={s} 
                  accountId={account.id} 
                  onPress={() => router.push({ pathname: '/statement/[id]', params: { id: s.id, cardId: account.id } })}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#a1a1aa',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181b',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#52525b',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  stmtCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  stmtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stmtIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stmtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  stmtBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  stmtBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stmtMonth: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  stmtAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18181b',
    letterSpacing: -1,
    marginTop: 2,
  },
  stmtDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
    marginTop: 6,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e4e4e7',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1aa',
  },
});
