import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Kalendar', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="new-appointment"
        options={{ title: 'Zakaži', tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="my-appointments"
        options={{ title: 'Moji termini', tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="urgent-request"
        options={{ title: 'Hitno', tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="price-list"
        options={{ title: 'Cenovnik', tabBarIcon: ({ color, size }) => <Ionicons name="pricetag" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
