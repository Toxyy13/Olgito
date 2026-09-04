import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import { RebookPrompt } from '../../src/components/RebookPrompt';
import { ClientChat } from '../../src/components/ClientChat';
import { StatTile, StatTileRow } from '../../src/components/StatTile';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchAppointmentsForClient, cancelAppointment, confirmAppointment } from '../../src/api/appointments';
import { watchRescheduleRequestsForClient, respondRescheduleRequest } from '../../src/api/rescheduleRequests';
import { dateTimeToMillis, formatDateLong } from '../../src/utils/time';
import type { Appointment, RescheduleRequest } from '../../src/types';

export default function MyAppointmentsScreen() {
  const { appUser } = useAuth();
  const { alert } = useAppAlert();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [dismissedRebookIds, setDismissedRebookIds] = useState<string[]>([]);
  const [editRequest, setEditRequest] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!appUser) return;
    return watchAppointmentsForClient(appUser.uid, setAppointments);
  }, [appUser]);

  // Termin koji je upravo završen i još nije ponuđeno zakazivanje sledećeg —
  // uzimamo najskorije završen da ne zatrpamo klijenta sa više ponuda odjednom.
  const rebookCandidate = useMemo(() => {
    const now = Date.now();
    const eligible = appointments.filter(
      (a) =>
        a.status !== 'otkazano' &&
        !a.rebookPromptedAt &&
        !dismissedRebookIds.includes(a.id) &&
        dateTimeToMillis(a.date, a.endTime) < now
    );
    if (eligible.length === 0) return null;
    return eligible.reduce((latest, a) => (a.startAtMillis > latest.startAtMillis ? a : latest));
  }, [appointments, dismissedRebookIds]);

  useEffect(() => {
    if (!appUser) return;
    return watchRescheduleRequestsForClient(appUser.uid, setRescheduleRequests);
  }, [appUser]);

  const handleCancel = (item: Appointment) => {
    alert('Otkazivanje termina', `Da li sigurno želiš da otkažeš termin ${item.date} u ${item.startTime}?`, [
      { text: 'Ne', style: 'cancel' },
      {
        text: 'Da, otkaži',
        style: 'destructive',
        onPress: () =>
          cancelAppointment(item, 'client').catch(() => alert('Greška', 'Termin nije otkazan. Pokušaj ponovo.')),
      },
    ]);
  };

  const handleConfirm = (item: Appointment) =>
    confirmAppointment(item.id).catch(() => alert('Greška', 'Dolazak nije potvrđen. Pokušaj ponovo.'));

  const handleRespondReschedule = (req: RescheduleRequest, accepted: boolean) => {
    respondRescheduleRequest(req.id, accepted)
      .then(() => {
        if (!accepted) {
          alert('Poslato', 'Obavestili smo Olgicu da ne možeš da pomeriš ovaj termin.');
        }
      })
      .catch(() => alert('Greška', 'Odgovor nije poslat. Pokušaj ponovo.'));
  };

  // Predstojeći termini idu u header (obično ih je par, ne treba im sopstveni
  // skrol), a istorija (prošli i otkazani termini) je glavna skrolabilna lista.
  const upcoming = appointments
    .filter((a) => a.status !== 'otkazano' && a.startAtMillis > Date.now())
    .sort((a, b) => a.startAtMillis - b.startAtMillis);
  const history = appointments
    .filter((a) => a.status === 'otkazano' || a.startAtMillis <= Date.now())
    .sort((a, b) => b.startAtMillis - a.startAtMillis);
  const cancelledCount = appointments.filter((a) => a.status === 'otkazano').length;
  const completedCount = history.length - cancelledCount;

  const renderCard = (item: Appointment) => (
    <View style={[styles.card, item.status === 'potvrdjeno' && styles.cardHighlighted]} key={item.id}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {formatDateLong(item.date)} • {item.startTime}–{item.endTime}
        </Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.services}>{item.serviceNames.join(', ')}</Text>
      <Text style={styles.people}>{item.peopleCount} {item.peopleCount === 1 ? 'osoba' : 'osobe/a'}</Text>
      {item.status !== 'otkazano' && item.startAtMillis > Date.now() && (
        <View style={styles.actions}>
          {item.status === 'zakazano' && (
            <Button title="Potvrdi dolazak" variant="secondary" onPress={() => handleConfirm(item)} />
          )}
          <Button title="Izmeni termin" variant="secondary" onPress={() => setEditRequest(item)} />
          <Button title="Otkaži" variant="outline" onPress={() => handleCancel(item)} />
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Pregled" title="Moji termini" />
      {appointments.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <StatTileRow>
            <StatTile value={upcoming.length} label="Nadolazeći" />
            <StatTile value={completedCount} label="Završeni" />
            <StatTile value={cancelledCount} label="Otkazani" />
          </StatTileRow>
        </View>
      )}
      <FlatList
        style={{ flex: 1 }}
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, gap: spacing.md, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            {rescheduleRequests.length > 0 && (
              <View style={{ gap: spacing.md }}>
                {rescheduleRequests.map((req) => {
                  const appt = appointments.find((a) => a.id === req.appointmentId);
                  return (
                    <View key={req.id} style={styles.rescheduleCard}>
                      <Text style={styles.rescheduleTitle}>Olgica traži pomeranje termina</Text>
                      {appt && (
                        <Text style={styles.rescheduleAppt}>
                          {formatDateLong(appt.date)} • {appt.startTime}–{appt.endTime}
                        </Text>
                      )}
                      <Text style={styles.rescheduleMessage}>{req.message}</Text>
                      <View style={styles.actions}>
                        <Button title="Mogu" variant="secondary" onPress={() => handleRespondReschedule(req, true)} />
                        <Button title="Ne mogu" variant="outline" onPress={() => handleRespondReschedule(req, false)} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {upcoming.length > 0 && (
              <View style={{ gap: spacing.md }}>
                <Text style={styles.sectionTitle}>Predstojeći termini</Text>
                {upcoming.map(renderCard)}
              </View>
            )}

            <Text style={styles.sectionTitle}>Istorija termina</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {appointments.length === 0 ? 'Još uvek nemaš zakazanih termina.' : 'Još uvek nemaš prošlih termina.'}
          </Text>
        }
        renderItem={({ item }) => renderCard(item)}
      />

      <RebookPrompt
        appointment={rebookCandidate}
        onDone={() => {
          if (rebookCandidate) setDismissedRebookIds((prev) => [...prev, rebookCandidate.id]);
        }}
      />

      <ClientChat
        clientId={editRequest ? appUser?.uid ?? null : null}
        title="Poruke sa Olgicom"
        initialText={
          editRequest
            ? `Zdravo! Da li mogu da promenim termin ${editRequest.date} u ${editRequest.startTime}? Predlažem: `
            : undefined
        }
        onClose={() => setEditRequest(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  sectionTitle: { ...typography.bodyBold, color: colors.textPrimary },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHighlighted: { backgroundColor: colors.surface, borderColor: 'transparent' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.bodyBold, color: colors.textPrimary },
  services: { color: colors.textSecondary, ...typography.small },
  people: { color: colors.textSecondary, ...typography.small },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  rescheduleCard: {
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderLeftWidth: 5,
    borderLeftColor: colors.sun,
  },
  rescheduleTitle: { ...typography.bodyBold, color: colors.textPrimary },
  rescheduleAppt: { color: colors.textSecondary, ...typography.small },
  rescheduleMessage: { color: colors.textPrimary, ...typography.body, marginVertical: spacing.xs },
});
