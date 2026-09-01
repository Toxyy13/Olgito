import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { watchPendingClients } from '../../src/api/users';
import { watchOpenUrgentRequests } from '../../src/api/urgentRequests';
import { watchConversations } from '../../src/api/messages';

export default function AdminTabsLayout() {
  const [pendingCount, setPendingCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => watchPendingClients((users) => setPendingCount(users.length)), []);
  useEffect(
    () => watchOpenUrgentRequests((requests) => setUrgentCount(requests.filter((r) => r.status === 'open').length)),
    []
  );
  useEffect(() => watchConversations((conversations) => setMessageCount(conversations.length)), []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textOnPrimary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarBadgeStyle: { backgroundColor: colors.statusOtkazano, color: colors.textOnPrimary },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Kalendar', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="new-clients"
        options={{
          title: 'Novi klijenti',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add" color={color} size={size} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Klijenti', tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="urgent-requests"
        options={{
          title: 'Hitno',
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" color={color} size={size} />,
          tabBarBadge: urgentCount > 0 ? urgentCount : undefined,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Poruke',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />,
          tabBarBadge: messageCount > 0 ? messageCount : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Podešavanja', tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
