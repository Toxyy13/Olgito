import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchOpenUrgentRequests, resolveUrgentRequest } from '../../src/firebase/urgentRequests';
import type { UrgentRequest } from '../../src/types';

export default function UrgentRequestsScreen() {
  const [requests, setRequests] = useState<UrgentRequest[]>([]);

  useEffect(() => watchOpenUrgentRequests(setRequests), []);

  const open = requests.filter((r) => r.status === 'open');

  return (
    <ScreenContainer>
      <Text style={styles.title}>Hitni zahtevi 🚨</Text>
      <FlatList
        data={open}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.empty}>Nema aktivnih hitnih zahteva.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.clientName}</Text>
            <Text style={styles.phone}>{item.clientPhone}</Text>
            <Text style={styles.note}>{item.note}</Text>
            <Button title="Označi kao rešeno" variant="secondary" onPress={() => resolveUrgentRequest(item.id)} />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderLeftWidth: 5,
    borderLeftColor: colors.accent,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
  note: { color: colors.textPrimary, ...typography.body, marginVertical: spacing.xs },
});
