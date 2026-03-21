import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HapticTab } from '@/shared/components/haptic-tab';
import { TopBar } from '@/features/dashboard/components/TopBar';

export default function TabLayout() {

  return (
    <Tabs
    // configuração global padrão para todas as tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981', // emerald-500
        tabBarInactiveTintColor: '#a1a1aa', // zinc-400
        header: () => <TopBar />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f4f4f5',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Feather size={22} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color }) => <Feather size={22} name="list" color={color} />,
        }}
      />
      
      {/* Modal/FAB Central Button */}
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.fabContainer}>
              <View style={styles.fab}>
                <Feather size={24} name="plus" color="#ffffff" />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarIcon: ({ color }) => <Feather size={22} name="credit-card" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Feather size={22} name="menu" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 4,
    borderColor: '#ffffff',
  }
});
