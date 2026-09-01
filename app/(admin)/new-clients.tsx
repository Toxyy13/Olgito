import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchPendingClients, approveClient, rejectClient } from '../../src/firebase/users';
import type { AppUser } from '../../src/types';

export default function NewClientsScreen() {
  const [pending, setPending] = useState<AppUser[]>([]);

  useEffect(() => watchPendingClients(setPending), []);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Novi klijenti</Text>
      <FlatList
        data={pending}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.empty}>Nema naloga na čekanju.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{item.fullName?.charAt(0) || '?'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.fullName || 'Nepopunjeno ime'}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
                {item.age != null && <Text style={styles.phone}>{item.age} godina</Text>}
              </View>
            </View>
            <View style={styles.actions}>
              <Button title="Odobri" onPress={() => approveClient(item.uid)} />
              <Button title="Odbij" variant="outline" onPress={() => rejectClient(item.uid)} />
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 20 },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
