import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

import { HapticTab } from '@/shared/components/haptic-tab';
import { TopBar } from '@/features/dashboard/components/TopBar';
import { QuickActionsMenu, QuickActionType } from '@/features/dashboard/components/QuickActionsMenu';

const ROUTES: Record<QuickActionType, string> = {
  recipe: 'new-recipe',
  expense: 'new-expense',
  category: 'categories',
  responsible: 'responsibles',
};

export default function TabLayout() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const fabScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fabScale.value = withTiming(0.96, { duration: 100 }, () => {
      fabScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    });
    setMenuVisible(true);
  };

  const handleMenuSelect = (action: QuickActionType) => {
    setMenuVisible(false);
    router.push(`/(tabs)/${ROUTES[action]}` as any);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#18181b', // Emphasizing active color? Currently it is `#10b981`. Let's keep `#18181b` as image shows dark grey. Or let's see, it is soft gray for inactive, darker for active.
          tabBarInactiveTintColor: '#a1a1aa',
          header: () => <TopBar />,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#f4f4f5',
            borderTopWidth: 0,
            elevation: 0, // Remove shadow
            height: 70, // Slightly taller height
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Poppins_500Medium',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="home-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Extrato',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="wallet-outline" color={color} />,
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarButton: () => (
              <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
                <Pressable
                  onPress={handleFabPress}
                  style={styles.fab}
                >
                  <Feather size={24} name="plus" color="#18181b" />
                </Pressable>
              </Animated.View>
            ),
          }}
        />

        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Contas/Cartões',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="card-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="person-outline" color={color} />,
          }}
        />
        <Tabs.Screen name="new-recipe" options={{ href: null }} />
        <Tabs.Screen name="new-expense" options={{ href: null }} />
        <Tabs.Screen name="new-category" options={{ href: null }} />
        <Tabs.Screen name="new-responsible" options={{ href: null }} />
        <Tabs.Screen name="categories" options={{ href: null }} />
        <Tabs.Screen name="responsibles" options={{ href: null }} />
      </Tabs>

      <QuickActionsMenu
        visible={menuVisible}
        onClose={handleMenuClose}
        onSelect={handleMenuSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCC419',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FCC419',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 6,
    borderColor: '#ffffff',
  },
});
