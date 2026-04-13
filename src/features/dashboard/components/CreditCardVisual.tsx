import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Account } from '@/features/dashboard/services/account.service';

export function CreditCardVisual({
  account,
  usedAmount,
  onEdit,
  onDelete,
}: {
  account: Account;
  usedAmount?: number;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
}) {
  const limit = Number(account.limitAmount || 0);
  const used = usedAmount !== undefined ? usedAmount : Math.abs(Number(account.currentBalance || 0));
  const available = Math.max(limit - used, 0);
  const usagePercentage = limit > 0 ? (used / limit) * 100 : 0;
  
  const usageColor = usagePercentage > 85 ? '#f43f5e' : usagePercentage > 60 ? '#fbbf24' : '#34d399';
  const color = '#18181b'; // Premium base color

  return (
    <View style={[styles.ccContainer, { backgroundColor: color }]}>
      {/* Decorative Orbs */}
      <View style={styles.ccOrbTopRight} />
      <View style={styles.ccOrbBottomLeft} />
      <View style={styles.ccOrbCenter} />

      {/* Top Actions Row */}
      <View style={styles.ccTopBar}>
        <View style={styles.ccStatusBadge}>
          <View style={[styles.cardStatusDot, { backgroundColor: account.isActive ? '#10b981' : 'rgba(255,255,255,0.4)' }]} />
          <Text style={styles.cardStatusText}>{account.isActive ? 'Ativo' : 'Inativo'}</Text>
        </View>
        <View style={styles.ccActions}>
          <TouchableOpacity onPress={() => onEdit(account)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}>
            <Feather name="edit-2" size={15} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(account)} hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}>
            <Feather name="trash-2" size={15} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chip and Brand Row */}
      <View style={styles.ccChipBrandRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.ccMockChip}>
            <View style={styles.ccChipInnerBorder} />
            <View style={styles.ccChipInnerBorder2} />
          </View>
          <Feather name="wifi" size={18} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
          <View style={[styles.brandCircle, { backgroundColor: 'rgba(244, 63, 94, 0.9)', right: -14, zIndex: 2 }]} />
          <View style={[styles.brandCircle, { backgroundColor: 'rgba(251, 191, 36, 0.9)', zIndex: 1 }]} />
        </View>
      </View>

      {/* Name */}
      <View style={styles.ccNameContainer}>
        <Text style={styles.ccTypeLabel}>Cartão de Crédito</Text>
        <Text style={styles.ccName} numberOfLines={1}>{account.name}</Text>
      </View>

      {/* Balance details */}
      <View style={styles.ccBalanceRow}>
        <View>
          <Text style={styles.ccAvailableLabel}>Disponível</Text>
          <View style={styles.ccAvailableRow}>
            <Text style={styles.ccCurrency}>R$</Text>
            <Text style={styles.ccAvailableValue}>
              {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 2 }}>
          <Text style={styles.ccAvailableLabel}>Limite Total</Text>
          <Text style={styles.ccLimitValue}>
            R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Usage Bar */}
      <View style={styles.ccUsageContainer}>
        <View style={styles.ccUsageTrack}>
          <View style={[styles.ccUsageFill, { width: `${Math.min(usagePercentage, 100)}%`, backgroundColor: usageColor }]} />
        </View>
        <Text style={styles.ccUsageLabelText}>{usagePercentage.toFixed(0)}% utilizado</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ccContainer: {
    borderRadius: 28,
    padding: 24,
    minHeight: 240,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  ccOrbTopRight: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ccOrbBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  ccOrbCenter: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 280,
    height: 280,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  ccTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  ccStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  cardStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  cardStatusText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ccActions: {
    flexDirection: 'row',
    gap: 16,
  },
  ccChipBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  ccMockChip: {
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(250,204,21,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  ccChipInnerBorder: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  ccChipInnerBorder2: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  brandCircle: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ccNameContainer: {
    zIndex: 10,
    marginBottom: 16,
  },
  ccTypeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ccName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  ccBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 10,
    marginBottom: 16,
  },
  ccAvailableLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ccAvailableRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  ccCurrency: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  ccAvailableValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  ccLimitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  ccUsageContainer: {
    zIndex: 10,
  },
  ccUsageTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  ccUsageFill: {
    height: '100%',
    borderRadius: 9999,
  },
  ccUsageLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'right',
  },
});
