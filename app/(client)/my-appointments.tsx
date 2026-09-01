import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { watchAppointmentsForClient, cancelAppointment, confirmAppointment } from '../../src/firebase/appointments';
import type { Appointment } from '../../src/types';

export default function MyAppointmentsScreen() {
  const { appUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!appUser) return;
    return watchAppointmentsForClient(appUser.uid, setAppointments);
  }, [appUser]);

  const handleCancel = (item: Appointment) => {
    Alert.alert('Otkazivanje termina', `Da li sigurno želiš da otkažeš termin ${item.date} u ${item.startTime}?`, [
      { text: 'Ne', style: 'cancel' },
      {
        text: 'Da, otkaži',
        style: 'destructive',
        onPress: () => cancelAppointment(item, 'client'),
      },
    ]);
  };

  const handleConfirm = (item: Appointment) => confirmAppointment(item.id);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Moji termini</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
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
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.bodyBold, color: colors.textPrimary },
  services: { color: colors.textSecondary, ...typography.small },
  people: { color: colors.textSecondary, ...typography.small },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
