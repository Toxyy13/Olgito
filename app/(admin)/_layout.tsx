import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textOnPrimary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Kalendar', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="new-clients"
        options={{ title: 'Novi klijenti', tabBarIcon: ({ color, size }) => <Ionicons name="person-add" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Klijenti', tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="urgent-requests"
        options={{ title: 'Hitno', tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Podešavanja', tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
