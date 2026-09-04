import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Button } from '../../src/components/Button';
import { UrgentRequestChat } from '../../src/components/UrgentRequestChat';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAppAlert } from '../../src/context/AlertContext';
import { createUrgentRequest, watchMyUrgentRequests } from '../../src/api/urgentRequests';
import type { UrgentRequest } from '../../src/types';

export default function UrgentRequestScreen() {
  const { appUser } = useAuth();
  const { alert } = useAppAlert();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<UrgentRequest[]>([]);
  const [chatWith, setChatWith] = useState<UrgentRequest | null>(null);

  useEffect(() => watchMyUrgentRequests(setMyRequests), []);

  const handleSubmit = async () => {
    if (!appUser || note.trim().length < 5) {
      alert('Nedostaje opis', 'Napiši kratko kada bi ti termin bio potreban.');
      return;
    }
    setLoading(true);
    try {
      await createUrgentRequest({
        clientId: appUser.uid,
        clientName: appUser.fullName,
        clientPhone: appUser.phone,
        note: note.trim(),
      });
      setNote('');
      alert('Zahtev poslat', 'Olgica je obaveštena i javiće ti se čim bude mogla da ti pronađe termin.');
    } catch {
      alert('Greška', 'Nešto nije u redu. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader
        eyebrow="Nema slobodnog termina?"
        title="Hitan zahtev"
        description="Javi Olgici kada bi ti termin bio potreban — potrudiće se da ti izađe u susret."
      />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Kada bi ti termin bio potreban i zašto</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Npr. treba mi termin danas posle 18h, imam važan događaj sutra..."
            placeholderTextColor={colors.textSecondary}
          />
          <Button title="Pošalji zahtev" onPress={handleSubmit} loading={loading} />
        </View>

        {myRequests.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.historyTitle}>Moji zahtevi</Text>
            {myRequests.map((r) => (
              <View key={r.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyStatus}>{r.status === 'open' ? 'Aktivan' : 'Rešeno'}</Text>
                </View>
                <Text style={styles.historyNote}>{r.note}</Text>
                <Button title="Poruke" variant="secondary" onPress={() => setChatWith(r)} />
              </View>
            ))}
          </View>
        )}
      </View>

      <UrgentRequestChat request={chatWith} title="Dogovor sa Olgicom" onClose={() => setChatWith(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: { ...typography.bodyBold, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  history: { gap: spacing.sm, marginTop: spacing.lg },
  historyTitle: { ...typography.bodyBold, color: colors.textPrimary },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  historyHeader: { flexDirection: 'row' },
  historyStatus: { ...typography.label, color: colors.sun },
  historyNote: { color: colors.textPrimary, ...typography.body },
});
