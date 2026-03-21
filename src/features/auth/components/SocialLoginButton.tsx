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
    <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onPress}>
      <Feather name={iconName} size={18} color={iconColor} style={{ marginRight: 8 }} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f3f46',
  },
});
