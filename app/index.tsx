import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../src/theme';

// AuthGate (u app/_layout.tsx) odmah preusmerava odavde na pravi ekran
// na osnovu stanja prijave — ovaj ekran se praktično nikad ne vidi.
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
