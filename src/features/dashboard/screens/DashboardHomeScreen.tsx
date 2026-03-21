import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function DashboardHomeScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiStack}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Geral</Text>
          <Text style={styles.balanceValue}>R$ 15.240,50</Text>
          <Text style={styles.balanceSub}>Livre: R$ 12.000,00</Text>
        </View>

        <View style={styles.rowKpi}>
          <View style={[styles.baseCard, styles.kpiHalfCard]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>Receitas</Text>
              <Feather name="arrow-up-circle" size={16} color="#10b981" />
            </View>
            <Text style={styles.kpiValue}>R$ 4.500,00</Text>
            <Text style={[styles.kpiTrend, { color: '#10b981' }]}>+5.2%</Text>
          </View>

          <View style={[styles.baseCard, styles.kpiHalfCard]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>Despesas</Text>
              <Feather name="arrow-down-circle" size={16} color="#f43f5e" />
            </View>
            <Text style={styles.kpiValue}>R$ 2.150,00</Text>
            <Text style={[styles.kpiTrend, { color: '#f43f5e' }]}>-1.4%</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainStack}>
        <View style={styles.baseCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suas Contas</Text>
            <TouchableOpacity hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <Text style={styles.linkText}>Gerenciar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
          >
            <View style={[styles.accountCard, { backgroundColor: '#10b981' }]}>
              <Text style={styles.accountType}>Conta Corrente</Text>
              <Text style={styles.accountName}>Nubank</Text>
              <Text style={styles.accountLabelSmall}>Saldo disponível</Text>
              <Text style={styles.accountBalance}>R$ 5.240,50</Text>
            </View>

            <View style={[styles.accountCard, { backgroundColor: '#6366f1' }]}>
              <Text style={styles.accountType}>Investimento</Text>
              <Text style={styles.accountName}>Inter</Text>
              <Text style={styles.accountLabelSmall}>Saldo disponível</Text>
              <Text style={styles.accountBalance}>R$ 10.000,00</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.baseCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.iconBox}>
                <Feather name="credit-card" size={14} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Faturas Abertas</Text>
            </View>
          </View>
          <View style={styles.invoiceItem}>
            <View>
              <Text style={styles.invoiceName}>Cartão XP</Text>
              <Text style={styles.invoiceDue}>Vence 10/05</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.invoiceAmount}>R$ 1.250,00</Text>
              <Text style={styles.invoiceStatus}>Aberta</Text>
            </View>
          </View>
        </View>

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

          <TouchableOpacity style={styles.txRow}>
            <View style={[styles.txIconBox, { backgroundColor: '#d1fae5' }]}>
              <Feather name="dollar-sign" size={16} color="#059669" />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc} numberOfLines={1}>Salário Mensal</Text>
              <Text style={styles.txDate}>Hoje, 09:00</Text>
            </View>
            <Text style={[styles.txValue, { color: '#059669' }]}>+R$ 4.500,00</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.txRow}>
            <View style={[styles.txIconBox, { backgroundColor: '#fee2e2' }]}>
              <Feather name="shopping-bag" size={16} color="#e11d48" />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc} numberOfLines={1}>Supermercado Extra</Text>
              <Text style={styles.txDate}>Ontem, 20:30</Text>
            </View>
            <Text style={styles.txValue}>-R$ 350,00</Text>
          </TouchableOpacity>
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
    marginTop: 4,
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
