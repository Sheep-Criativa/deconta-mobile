import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Account } from '@/features/dashboard/services/account.service';

export function CreditCardVisual({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
}) {
  const limit = account.limitAmount || 0;
  const used = Math.abs(account.currentBalance || 0);
  const available = Math.max(limit - used, 0);
  const usagePercentage = limit > 0 ? (used / limit) * 100 : 0;
  
  // Base dark color to mimic the premium feel. We can also use a gradient or the category colors.
  const color = '#18181b';

  return (
    <View style={[styles.ccContainer, { backgroundColor: color }]}>
      {/* Decorative Blur Orbs */}
      <View style={styles.ccOrbTopRight} />
      <View style={styles.ccOrbBottomLeft} />

      <View style={styles.ccContentRow}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.ccTypeLabel}>Cartão de Crédito</Text>
          <Text style={styles.ccName} numberOfLines={1}>{account.name}</Text>
          <View style={styles.ccStatusRow}>
            <View style={[styles.cardStatusDot, { backgroundColor: account.isActive ? '#10b981' : 'rgba(255,255,255,0.4)', width: 6, height: 6 }]} />
            <Text style={[styles.cardStatusText, { fontSize: 10 }]}>{account.isActive ? 'Ativo' : 'Inativo'}</Text>
          </View>
        </View>
        <View style={styles.ccTopRight}>
          <View style={styles.ccActions}>
            <TouchableOpacity onPress={() => onEdit(account)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}>
              <Feather name="edit-2" size={15} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(account)} hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}>
              <Feather name="trash-2" size={15} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <View style={{ gap: 8, alignItems: 'flex-end' }}>
            <View style={styles.ccWifiBox}>
              <Feather name="wifi" size={16} color="rgba(255,255,255,0.8)" style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
            
            {/* Decorative EMV Chip */}
            <View style={styles.ccMockChip}>
              <View style={styles.ccChipInnerBorder} />
              <View style={styles.ccChipInnerBorder2} />
            </View>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, minHeight: 16 }} />

      <View style={styles.ccAvailableContainer}>
        <Text style={styles.ccAvailableLabel}>Limite Disponível</Text>
        <View style={styles.ccAvailableRow}>
          <Text style={styles.ccCurrency}>R$</Text>
          <Text style={styles.ccAvailableValue}>
            {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.ccUsageContainer}>
        <View style={styles.ccUsageLabelsRow}>
          <Text style={styles.ccUsageLabelText}>Uso do Limite</Text>
          <Text style={styles.ccUsageLabelText}>{usagePercentage.toFixed(0)}%</Text>
        </View>
        <View style={styles.ccUsageTrack}>
          <View style={[styles.ccUsageFill, { width: `${Math.min(usagePercentage, 100)}%` }]} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  ccContainer: {
    borderRadius: 24,
    padding: 24,
    height: 220,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    position: 'relative',
    marginBottom: 8,
  },
  ccOrbTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ccOrbBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  ccContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  ccTypeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ccName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  ccStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  cardStatusDot: {
    borderRadius: 9999,
  },
  cardStatusText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  ccTopRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  ccActions: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ccWifiBox: {
    width: 44,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  ccAvailableContainer: {
    zIndex: 10,
    marginBottom: 16,
  },
  ccAvailableLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ccAvailableRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 0,
  },
  ccCurrency: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  ccAvailableValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  ccUsageContainer: {
    zIndex: 10,
  },
  ccUsageLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ccUsageLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ccUsageTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  ccUsageFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 9999,
  },
  ccMockChip: {
    width: 43,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(250,204,21,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    opacity: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  ccChipInnerBorder: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ccChipInnerBorder2: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
