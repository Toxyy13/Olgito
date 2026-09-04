import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { Button } from '../../../src/components/Button';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { useAppAlert } from '../../../src/context/AlertContext';
import { watchRejectedClients, approveClient } from '../../../src/api/users';
import type { AppUser } from '../../../src/types';

export default function RejectedClientsScreen() {
  const { alert } = useAppAlert();
  const [rejected, setRejected] = useState<AppUser[]>([]);

  useEffect(() => watchRejectedClients(setRejected), []);

  return (
    <ScreenContainer showBack>
      <ScreenHeader eyebrow="Arhiva" title="Odbijeni klijenti" />
      <FlatList
        style={{ flex: 1 }}
        data={rejected}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.empty}>Nema odbijenih naloga.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.fullName || 'Nepopunjeno ime'}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            <Button
              title="Odobri ipak"
              variant="secondary"
              onPress={() => approveClient(item.uid).catch(() => alert('Greška', 'Nalog nije odobren. Pokušaj ponovo.'))}
            />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
});
