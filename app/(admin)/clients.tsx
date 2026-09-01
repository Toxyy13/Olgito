import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchAllClients, blockClient, unblockClient } from '../../src/firebase/users';
import type { AppUser } from '../../src/types';

export default function ClientsScreen() {
  const [clients, setClients] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => watchAllClients(setClients), []);

  const filtered = clients
    .filter((c) => c.accountStatus !== 'pending')
    .filter((c) => c.fullName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <ScreenContainer>
      <Text style={styles.title}>Klijenti</Text>
      <TextInput
        style={styles.search}
        placeholder="Pretraži po imenu ili broju..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            {item.accountStatus === 'blocked' ? (
              <Button title="Odblokiraj" variant="secondary" onPress={() => unblockClient(item.uid)} />
            ) : (
              <Button title="Blokiraj" variant="danger" onPress={() => blockClient(item.uid)} />
            )}
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
});
