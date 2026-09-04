import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, Modal, Pressable } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import { ClientChat } from '../../src/components/ClientChat';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchAllClients, blockClient, unblockClient } from '../../src/api/users';
import { getClientAppointmentHistory } from '../../src/api/appointments';
import { formatDateLong } from '../../src/utils/time';
import type { AppUser, Appointment } from '../../src/types';

export default function ClientsScreen() {
  const { alert } = useAppAlert();
  const [clients, setClients] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [chatWith, setChatWith] = useState<AppUser | null>(null);

  useEffect(() => watchAllClients(setClients), []);

  useEffect(() => {
    if (!selected) return;
    setLoadingHistory(true);
    getClientAppointmentHistory(selected.uid)
      .then(setHistory)
      .catch(() => alert('Greška', 'Istorija termina nije učitana.'))
      .finally(() => setLoadingHistory(false));
  }, [selected?.uid]);

  const filtered = clients
    .filter((c) => c.accountStatus === 'approved' || c.accountStatus === 'blocked')
    .filter((c) => c.fullName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'sr'));

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Baza klijenata" title="Klijenti" description={`${filtered.length} ${filtered.length === 1 ? 'klijent' : 'klijenata'} u bazi.`} />
      <TextInput
        style={styles.search}
        placeholder="Pretraži po imenu ili broju..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelected(item)}>
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{item.fullName?.charAt(0) || '?'}</Text>
              </View>
            )}
            <Text style={styles.name}>{item.fullName}</Text>
          </Pressable>
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  {selected.photoURL ? (
                    <Image source={{ uri: selected.photoURL }} style={styles.modalAvatar} />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{selected.fullName?.charAt(0) || '?'}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalName}>{selected.fullName}</Text>
                    <Text style={styles.modalContact}>{selected.phone}</Text>
                    <Text style={styles.modalContact}>{selected.email}</Text>
                    {selected.age != null && <Text style={styles.modalContact}>{selected.age} godina</Text>}
                  </View>
                </View>

                <Text style={styles.historyTitle}>Istorija zakazivanja</Text>
                {loadingHistory ? (
                  <Text style={styles.modalContact}>Učitavanje...</Text>
                ) : history.length === 0 ? (
                  <Text style={styles.modalContact}>Još uvek nema zakazanih termina.</Text>
                ) : (
                  <FlatList
                    data={history}
                    keyExtractor={(a) => a.id}
                    style={{ maxHeight: 260 }}
                    contentContainerStyle={{ gap: spacing.sm }}
                    renderItem={({ item }) => (
                      <View style={styles.historyRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyDate}>
                            {formatDateLong(item.date)} • {item.startTime}–{item.endTime}
                          </Text>
                          <Text style={styles.modalContact}>{item.serviceNames.join(', ')}</Text>
                        </View>
                        <StatusBadge status={item.status} />
                      </View>
                    )}
                  />
                )}

                <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                  <Button title="Pošalji poruku" onPress={() => setChatWith(selected)} />
                  {selected.accountStatus === 'blocked' ? (
                    <Button
                      title="Odblokiraj"
                      variant="secondary"
                      onPress={() => unblockClient(selected.uid).catch(() => alert('Greška', 'Klijent nije odblokiran. Pokušaj ponovo.'))}
                    />
                  ) : (
                    <Button
                      title="Blokiraj"
                      variant="danger"
                      onPress={() => blockClient(selected.uid).catch(() => alert('Greška', 'Klijent nije blokiran. Pokušaj ponovo.'))}
                    />
                  )}
                  <Button title="Zatvori" variant="outline" onPress={() => setSelected(null)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <ClientChat
        clientId={chatWith?.uid ?? null}
        title={chatWith ? `Poruke: ${chatWith.fullName}` : undefined}
        onClose={() => setChatWith(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  search: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
  },
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  modalAvatar: { width: 64, height: 64, borderRadius: 32 },
  modalAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.glassBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalName: { ...typography.h3, color: colors.textPrimary },
  modalContact: { color: colors.textSecondary, ...typography.small },
  historyTitle: { ...typography.bodyBold, color: colors.textPrimary, marginTop: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  historyDate: { color: colors.textPrimary, ...typography.small, fontWeight: '700' },
});
