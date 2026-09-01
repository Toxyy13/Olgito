import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';
import { NavMenuProvider } from '../../src/context/NavMenuContext';
import { SideMenu, type SideMenuItem } from '../../src/components/SideMenu';

const ITEMS: SideMenuItem[] = [
  { name: 'calendar', icon: 'calendar', label: 'Kalendar' },
  { name: 'new-appointment', icon: 'add-circle', label: 'Zakaži' },
  { name: 'my-appointments', icon: 'list', label: 'Moji termini' },
  { name: 'urgent-request', icon: 'alert-circle', label: 'Hitno' },
  { name: 'messages', icon: 'chatbubbles', label: 'Poruke' },
  { name: 'price-list', icon: 'pricetag', label: 'Cenovnik' },
  { name: 'profile', icon: 'person-circle', label: 'Profil' },
];

export default function ClientTabsLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <NavMenuProvider value={{ open: () => setMenuOpen(true) }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} groupPath="/(client)" items={ITEMS} />
    </NavMenuProvider>
  );
}
