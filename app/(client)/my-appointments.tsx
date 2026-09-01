import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchAppointmentsForClient, cancelAppointment, confirmAppointment } from '../../src/api/appointments';
import { watchRescheduleRequestsForClient, respondRescheduleRequest } from '../../src/api/rescheduleRequests';
import type { Appointment, RescheduleRequest } from '../../src/types';

export default function MyAppointmentsScreen() {
  const { appUser } = useAuth();
  const { alert } = useAppAlert();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);

  useEffect(() => {
    if (!appUser) return;
    return watchAppointmentsForClient(appUser.uid, setAppointments);
  }, [appUser]);

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

  return (
    <ScreenContainer>
      <ScreenHeader title="Moji termini" />
      <FlatList
        style={{ flex: 1 }}
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View>
            {rescheduleRequests.length > 0 && (
              <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
                {rescheduleRequests.map((req) => {
                  const appt = appointments.find((a) => a.id === req.appointmentId);
                  return (
                    <View key={req.id} style={styles.rescheduleCard}>
                      <Text style={styles.rescheduleTitle}>Olgica traži pomeranje termina</Text>
                      {appt && (
                        <Text style={styles.rescheduleAppt}>
                          {appt.date} • {appt.startTime}–{appt.endTime}
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
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Još uvek nemaš zakazanih termina.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>
                {item.date} • {item.startTime}–{item.endTime}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.services}>{item.serviceNames.join(', ')}</Text>
            <Text style={styles.people}>{item.peopleCount} {item.peopleCount === 1 ? 'osoba' : 'osobe/a'}</Text>
            {item.status !== 'otkazano' && (
              <View style={styles.actions}>
                {item.status === 'zakazano' && (
                  <Button title="Potvrdi dolazak" variant="secondary" onPress={() => handleConfirm(item)} />
                )}
                <Button title="Otkaži" variant="outline" onPress={() => handleCancel(item)} />
              </View>
            )}
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.bodyBold, color: colors.textPrimary },
  services: { color: colors.textSecondary, ...typography.small },
  people: { color: colors.textSecondary, ...typography.small },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  rescheduleCard: {
    backgroundColor: colors.surfaceAlt,
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
