import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/theme';

export function TopBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          {/* Avatar Base */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarFallback}>V</Text>
          </View>
          <View>
            <Text style={styles.greetingText}>Olá,</Text>
            <Text style={styles.nameText}>Visitante</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.notificationBtn}>
          <Feather name="bell" size={20} color="#52525b" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  greetingText: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#18181b',
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f43f5e',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
});
