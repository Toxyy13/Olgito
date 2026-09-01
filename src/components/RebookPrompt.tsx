import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { markRebookPrompted } from '../api/appointments';
import type { Appointment } from '../types';

const WEEK_OPTIONS = [2, 3, 4];

function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

interface Props {
  appointment: Appointment | null;
  onDone: () => void;
}

export function RebookPrompt({ appointment, onDone }: Props) {
  const router = useRouter();

  const finish = async () => {
    if (appointment) {
      try {
        await markRebookPrompted(appointment.id);
      } catch {
        // tiho — u najgorem slučaju se ponuda pojavi ponovo sledeći put
      }
    }
    onDone();
  };

  const handlePickWeeks = async (weeks: number) => {
    if (!appointment) return;
    const date = addDaysISO(appointment.date, weeks * 7);
    await finish();
    router.push({ pathname: '/(client)/new-appointment', params: { date } });
  };

  if (!appointment) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Termin je završen! 🎉</Text>
          <Text style={styles.subtitle}>Da li želiš unapred da zakažeš sledeći termin?</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {WEEK_OPTIONS.map((w) => (
              <Button key={w} title={`Za ${w} nedelje`} variant="secondary" onPress={() => handlePickWeeks(w)} />
            ))}
            <Button title="Ne sada" variant="outline" onPress={finish} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, ...typography.body, textAlign: 'center' },
});
