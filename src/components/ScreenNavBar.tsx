/**
 * ScreenNavBar — barra de navegação simples e padronizada para telas principais.
 * Fundo branco, borda sutil, título à esquerda, ação opcional à direita.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface ScreenNavBarProps {
  /** Título principal exibido no centro-esquerdo */
  title: string;
  /** Subtítulo opcional abaixo do título */
  subtitle?: string;
  /** Ícone do botão de ação (direita). Se omitido, não renderiza botão. */
  actionIcon?: React.ComponentProps<typeof Feather>['name'];
  /** Callback do botão de ação */
  onAction?: () => void;
  /** Cor do botão de ação (padrão: verde-emerald) */
  actionColor?: string;
}

export function ScreenNavBar({
  title,
  subtitle,
  actionIcon,
  onAction,
  actionColor = '#10b981',
}: ScreenNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {actionIcon && onAction ? (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: actionColor }]}
          onPress={onAction}
          activeOpacity={0.82}
        >
          <Feather name={actionIcon} size={20} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  left: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#a1a1aa',
    letterSpacing: 0.2,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
