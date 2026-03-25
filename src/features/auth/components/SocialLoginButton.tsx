import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SocialLoginButtonProps {
  title: string;
  iconName: keyof typeof Feather.glyphMap;
  iconColor: string;
  onPress?: () => void;
}

export function SocialLoginButton({ title, iconName, iconColor, onPress }: SocialLoginButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
    >
      <Feather name={iconName} size={18} color={iconColor} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,               // touch target ≥ 44px (manual § 10.2)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d8',   // zinc-300
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3f3f46',         // zinc-700
  },
});
