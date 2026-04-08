import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type QuickActionType = 'recipe' | 'expense' | 'category' | 'responsible';

interface QuickActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: QuickActionType) => void;
}

interface MenuItemProps {
  iconType: 'feather' | 'ionicons';
  icon: string;
  label: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
  iconBgColor?: string;
  iconColor?: string;
  onPress: () => void;
}

const MENU_ITEMS: Array<{
  type: QuickActionType;
  iconType: 'feather' | 'ionicons';
  icon: string;
  label: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
  iconBgColor: string;
  iconColor: string;
}> = [
  {
    type: 'recipe',
    iconType: 'feather',
    icon: 'arrow-up',
    label: 'Receita',
    subtitle: 'Adicionar nova receita',
    backgroundColor: '#10b981',
    textColor: '#fff',
    iconBgColor: '#059669',
    iconColor: '#ecfdf5',
  },
  {
    type: 'expense',
    iconType: 'feather',
    icon: 'arrow-down',
    label: 'Despesa',
    subtitle: 'Adicionar nova despesa',
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    iconBgColor: '#7f1d1d',
    iconColor: '#fca5a5',
  },
  {
    type: 'category',
    iconType: 'feather',
    icon: 'tag',
    label: 'Categorias',
    backgroundColor: '#ffffff',
    textColor: '#18181b',
    iconBgColor: 'transparent',
    iconColor: '#3f3f46',
  },
  {
    type: 'responsible',
    iconType: 'feather',
    icon: 'users',
    label: 'Responsáveis',
    backgroundColor: '#ffffff',
    textColor: '#18181b',
    iconBgColor: 'transparent',
    iconColor: '#3f3f46',
  },
];

function MenuItem({
  iconType,
  icon,
  label,
  subtitle,
  backgroundColor,
  textColor,
  iconBgColor,
  iconColor,
  onPress,
}: MenuItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.menuItem,
          { backgroundColor },
          backgroundColor === '#ffffff' && styles.menuItemShadow,
        ]}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {iconType === 'feather' ? (
            <Feather name={icon as any} size={20} color={iconColor} />
          ) : (
            <Ionicons name={icon as any} size={20} color={iconColor} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.menuItemLabel, { color: textColor }]}>{label}</Text>
          {subtitle && (
            <Text style={[styles.menuItemSubtitle, { color: textColor }]}>{subtitle}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function QuickActionsMenu({ visible, onClose, onSelect }: QuickActionsMenuProps) {
  const translateY = useSharedValue(280);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.97);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 28, stiffness: 180, mass: 0.8 });
      opacity.value = withTiming(1, { duration: 280 });
      scale.value = withSpring(1, { damping: 28, stiffness: 180, mass: 0.8 });
    } else {
      translateY.value = withTiming(280, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.97, { duration: 200 });
    }
  }, [visible]);

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSelect = useCallback(
    async (action: QuickActionType) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect(action);
    },
    [onSelect]
  );

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.menuContainer, menuAnimatedStyle]}>
          <View style={styles.menu}>
            <View style={styles.menuItems}>
              {MENU_ITEMS.map((item) => (
                <MenuItem
                  key={item.type}
                  iconType={item.iconType}
                  icon={item.icon}
                  label={item.label}
                  subtitle={item.subtitle}
                  backgroundColor={item.backgroundColor}
                  textColor={item.textColor}
                  iconBgColor={item.iconBgColor}
                  iconColor={item.iconColor}
                  onPress={() => handleSelect(item.type)}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  menu: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  menuItems: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  menuItemShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
  },
  menuItemSubtitle: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    marginTop: -2,
    opacity: 0.8,
  },
});
