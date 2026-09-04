import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Button } from '../../src/components/Button';
import { SlotPicker } from '../../src/components/SlotPicker';
import { colors, radius, spacing, typography, calendarTheme } from '../../src/theme';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchActiveServices } from '../../src/api/services';
import { createAdminAppointment } from '../../src/api/appointments';
import { useAvailability } from '../../src/hooks/useAvailability';
import type { ServiceType } from '../../src/types';
import { todayISO } from '../../src/utils/time';
import { useClosedDatesForMonth } from '../../src/hooks/useClosedDates';
import { buildClosedDayMarks } from '../../src/utils/calendarMarks';

export default function AdminNewAppointmentScreen() {
  const { alert } = useAppAlert();
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [services, setServices] = useState<ServiceType[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [monthAnchor, setMonthAnchor] = useState(selectedDate);
  const closedDates = useClosedDatesForMonth(monthAnchor);
  const { dayHours, availableStarts, allSlots } = useAvailability(selectedDate, peopleCount);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => watchActiveServices(setServices), []);
  useEffect(() => setSelectedStart(null), [selectedDate, peopleCount]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const canSubmit =
    clientName.trim().length >= 2 && clientPhone.trim().length >= 5 && selectedServiceIds.length > 0 && !!selectedStart && !loading;

  const handleBook = async () => {
    if (!selectedStart) return;
    setLoading(true);
    try {
      const chosen = services.filter((s) => selectedServiceIds.includes(s.id));
      await createAdminAppointment({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        serviceIds: chosen.map((s) => s.id),
        serviceNames: chosen.map((s) => s.name),
        peopleCount,
        date: selectedDate,
        startTime: selectedStart,
        note,
      });
      alert('Termin dodat', `Termin za ${clientName.trim()} je zakazan ${selectedDate} u ${selectedStart}.`);
      setClientName('');
      setClientPhone('');
      setSelectedServiceIds([]);
      setNote('');
      setSelectedStart(null);
      router.push('/(admin)/calendar');
    } catch (e: any) {
      if (e?.message === 'SLOT_TAKEN') {
        alert('Termin zauzet', 'Taj termin je već zauzet. Izaberi drugi.');
      } else {
        alert('Greška', e?.message ?? 'Nešto nije u redu. Pokušaj ponovo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Dodaj termin" />
      <Text style={styles.subtitle}>Za nekog ko je zvao telefonom i nema aplikaciju.</Text>

      <Text style={styles.label}>Ime i prezime</Text>
      <TextInput
        style={styles.textInput}
        value={clientName}
        onChangeText={setClientName}
        placeholder="Npr. Marko Marković"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Broj telefona</Text>
      <TextInput
        style={styles.textInput}
        value={clientPhone}
        onChangeText={setClientPhone}
        placeholder="Npr. 0601234567"
        placeholderTextColor={colors.textSecondary}
        keyboardType="phone-pad"
      />

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
        onMonthChange={(m) => setMonthAnchor(m.dateString)}
        markingType="custom"
        markedDates={buildClosedDayMarks(closedDates, selectedDate)}
        theme={calendarTheme}
        style={styles.calendar}
      />

      <SlotPicker
        dayHours={dayHours}
        allSlots={allSlots}
        availableStarts={availableStarts}
        peopleCount={peopleCount}
        selectedStart={selectedStart}
        onSelect={setSelectedStart}
      />

      <Text style={styles.label}>Napomena (opciono)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Npr. želi kraću frizuru"
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Button title="Dodaj termin" onPress={handleBook} disabled={!canSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textSecondary, ...typography.body, marginBottom: spacing.md },
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
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 60,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
});
