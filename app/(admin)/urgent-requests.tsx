import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Button } from '../../src/components/Button';
import { UrgentRequestChat } from '../../src/components/UrgentRequestChat';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchOpenUrgentRequests, resolveUrgentRequest } from '../../src/api/urgentRequests';
import type { UrgentRequest } from '../../src/types';

export default function UrgentRequestsScreen() {
  const { alert } = useAppAlert();
  const [requests, setRequests] = useState<UrgentRequest[]>([]);
  const [chatWith, setChatWith] = useState<UrgentRequest | null>(null);

  useEffect(() => watchOpenUrgentRequests(setRequests), []);

  const open = requests.filter((r) => r.status === 'open');

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Prioritet" title="Hitni zahtevi" description="Klijenti kojima ne odgovara nijedan slobodan termin." />
      <FlatList
        style={{ flex: 1 }}
        data={open}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.empty}>Nema aktivnih hitnih zahteva.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              {item.clientPhotoURL ? (
                <Image source={{ uri: item.clientPhotoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{item.clientName?.charAt(0) || '?'}</Text>
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={styles.name}>{item.clientName}</Text>
                <Text style={styles.phone}>{item.clientPhone}</Text>
              </View>
            </View>
            <Text style={styles.note}>{item.note}</Text>
            <View style={styles.actions}>
              <Button title="Odgovori" onPress={() => setChatWith(item)} />
              <Button
                title="Označi kao rešeno"
                variant="secondary"
                onPress={() => resolveUrgentRequest(item.id).catch(() => alert('Greška', 'Zahtev nije označen. Pokušaj ponovo.'))}
              />
            </View>
          </View>
        )}
      />

      <UrgentRequestChat
        request={chatWith}
        title={chatWith ? `Dogovor sa: ${chatWith.clientName}` : undefined}
        onClose={() => setChatWith(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerText: { flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glassBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 18 },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
  note: { color: colors.textPrimary, ...typography.body, marginVertical: spacing.xs },
  actions: { gap: spacing.sm },
});
