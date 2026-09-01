import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography, calendarTheme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchActiveServices } from '../../src/api/services';
import { getEffectiveDayHours } from '../../src/api/workingHours';
import { getBusyRangesOnce } from '../../src/api/availability';
import { createAppointment } from '../../src/api/appointments';
import { computeAvailableStartTimes } from '../../src/utils/time';
import type { ServiceType, DayHours } from '../../src/types';
import { todayISO } from '../../src/utils/time';

export default function NewAppointmentScreen() {
  const { appUser } = useAuth();
  const { alert } = useAppAlert();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState(
    typeof params.date === 'string' && params.date >= todayISO() ? params.date : todayISO()
  );
  const [dayHours, setDayHours] = useState<DayHours | null>(null);
  const [availableStarts, setAvailableStarts] = useState<string[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => watchActiveServices(setServices), []);

  useEffect(() => {
    let cancelled = false;
    setSelectedStart(null);
    (async () => {
      try {
        const hours = await getEffectiveDayHours(selectedDate);
        if (cancelled) return;
        setDayHours(hours);
        if (hours.closed) {
          setAvailableStarts([]);
          return;
        }
        const busy = await getBusyRangesOnce(selectedDate);
        if (cancelled) return;
        let starts = computeAvailableStartTimes(hours.start, hours.end, busy, peopleCount);
        if (selectedDate === todayISO()) {
          const now = new Date();
          const nowHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          starts = starts.filter((t) => t > nowHHmm);
        }
        setAvailableStarts(starts);
      } catch {
        if (!cancelled) alert('Greška', 'Nije moguće učitati slobodne termine. Pokušaj ponovo.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, peopleCount]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const canSubmit = selectedServiceIds.length > 0 && !!selectedStart && !loading;

  const handleBook = async () => {
    if (!appUser || !selectedStart) return;
    setLoading(true);
    try {
      const chosen = services.filter((s) => selectedServiceIds.includes(s.id));
      await createAppointment({
        clientId: appUser.uid,
        clientName: appUser.fullName,
        clientPhone: appUser.phone,
        serviceIds: chosen.map((s) => s.id),
        serviceNames: chosen.map((s) => s.name),
        peopleCount,
        date: selectedDate,
        startTime: selectedStart,
        note,
      });
      alert('Uspešno zakazano', `Termin je zakazan za ${selectedDate} u ${selectedStart}.`);
      setSelectedServiceIds([]);
      setNote('');
      setSelectedStart(null);
      router.push('/(client)/my-appointments');
    } catch (e: any) {
      if (e?.message === 'SLOT_TAKEN') {
        alert('Termin zauzet', 'Neko je upravo zauzeo ovaj termin. Izaberi drugi.');
      } else {
        alert('Greška', 'Nešto nije u redu. Pokušaj ponovo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Novi termin" />

      <Text style={styles.label}>Usluge</Text>
      <View style={styles.chipsRow}>
        {services.map((s) => {
          const active = selectedServiceIds.includes(s.id);
          return (
            <Pressable key={s.id} onPress={() => toggleService(s.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Broj osoba</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => setPeopleCount((n) => Math.max(1, n - 1))}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{peopleCount}</Text>
        <Pressable style={styles.stepBtn} onPress={() => setPeopleCount((n) => Math.min(6, n + 1))}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
        <Text style={styles.stepHint}>({peopleCount * 30} min)</Text>
      </View>

      <Text style={styles.label}>Datum</Text>
      <Calendar
        current={selectedDate}
        minDate={todayISO()}
        onDayPress={(d) => setSelectedDate(d.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: colors.secondary } }}
        theme={calendarTheme}
        style={styles.calendar}
      />

      <Text style={styles.label}>Slobodni termini</Text>
      {dayHours?.closed ? (
        <Text style={styles.closed}>Olgica ne radi ovog dana 🌴</Text>
      ) : availableStarts.length === 0 ? (
        <Text style={styles.closed}>Nema slobodnih termina za izabrani broj osoba.</Text>
      ) : (
        <View style={styles.chipsRow}>
          {availableStarts.map((t) => (
            <Pressable
              key={t}
              onPress={() => setSelectedStart(t)}
              style={[styles.chip, selectedStart === t && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedStart === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.label}>Napomena (opciono)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Npr. želim kraću frizuru"
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Button title="Zakaži termin" onPress={handleBook} disabled={!canSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  label: { ...typography.bodyBold, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textPrimary, ...typography.small },
  chipTextActive: { color: colors.textOnPrimary, fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: colors.textOnPrimary, fontSize: 22, fontWeight: '700' },
  stepValue: { ...typography.h3, color: colors.textPrimary, minWidth: 24, textAlign: 'center' },
  stepHint: { color: colors.textSecondary, ...typography.small },
  calendar: { borderRadius: radius.md, overflow: 'hidden' },
  closed: { color: colors.textSecondary, ...typography.body },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 60,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
});
