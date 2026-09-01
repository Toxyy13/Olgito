import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';
import { watchPendingClients } from '../../src/api/users';
import { watchOpenUrgentRequests } from '../../src/api/urgentRequests';
import { watchConversations } from '../../src/api/messages';
import { NavMenuProvider } from '../../src/context/NavMenuContext';
import { SideMenu, type SideMenuItem } from '../../src/components/SideMenu';

export default function AdminTabsLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => watchPendingClients((users) => setPendingCount(users.length)), []);
  useEffect(
    () => watchOpenUrgentRequests((requests) => setUrgentCount(requests.filter((r) => r.status === 'open').length)),
    []
  );
  useEffect(() => watchConversations((conversations) => setMessageCount(conversations.length)), []);

  const items: SideMenuItem[] = [
    { name: 'calendar', icon: 'calendar', label: 'Kalendar' },
    { name: 'new-clients', icon: 'person-add', label: 'Novi klijenti', badge: pendingCount },
    { name: 'clients', icon: 'people', label: 'Klijenti' },
    { name: 'urgent-requests', icon: 'alert-circle', label: 'Hitno', badge: urgentCount },
    { name: 'messages', icon: 'chatbubbles', label: 'Poruke', badge: messageCount },
    { name: 'settings', icon: 'settings', label: 'Podešavanja' },
  ];

  return (
    <NavMenuProvider value={{ open: () => setMenuOpen(true) }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} groupPath="/(admin)" items={items} />
    </NavMenuProvider>
  );
}
