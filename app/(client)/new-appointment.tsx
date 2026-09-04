import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { ServiceSelector } from '../../src/components/ServiceSelector';
import { MonthDatePicker } from '../../src/components/MonthDatePicker';
import { Button } from '../../src/components/Button';
import { SlotPicker } from '../../src/components/SlotPicker';
import { colors, radius, spacing, typography, calendarTheme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAppAlert } from '../../src/context/AlertContext';
import { watchActiveServices } from '../../src/api/services';
import { createAppointment } from '../../src/api/appointments';
import { useAvailability } from '../../src/hooks/useAvailability';
import type { ServiceType } from '../../src/types';
import { todayISO } from '../../src/utils/time';
import { useClosedDatesForMonth } from '../../src/hooks/useClosedDates';
import { buildClosedDayMarks } from '../../src/utils/calendarMarks';

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
      <View style={styles.stack}>
        <ServiceSelector
          eyebrow="Korak 1 — Usluga"
          title="Izaberi uslugu"
          description="30-minutni termini. Cena se obračunava po osobi."
          services={services}
          selectedServiceIds={selectedServiceIds}
          onToggleService={toggleService}
          peopleCount={peopleCount}
          onPeopleCountChange={setPeopleCount}
        />

        <GlassCard>
          <EyebrowLabel>Korak 2 — Datum</EyebrowLabel>
          <Text style={styles.cardTitle}>Izaberi datum</Text>
          <MonthDatePicker
            current={selectedDate}
            minDate={todayISO()}
            onDayPress={(d) => setSelectedDate(d.dateString)}
            onMonthChange={(m) => setMonthAnchor(m.dateString)}
            markingType="custom"
            markedDates={buildClosedDayMarks(closedDates, selectedDate)}
            theme={calendarTheme}
            style={styles.calendar}
          />
        </GlassCard>

        <GlassCard>
          <EyebrowLabel>Korak 3 — Vreme</EyebrowLabel>
          <Text style={styles.cardTitle}>Slobodni termini</Text>
          <View style={{ marginTop: spacing.md }}>
            <SlotPicker
              dayHours={dayHours}
              allSlots={allSlots}
              availableStarts={availableStarts}
              peopleCount={peopleCount}
              selectedStart={selectedStart}
              onSelect={setSelectedStart}
            />
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Napomena (opciono)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Npr. želim kraću frizuru"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <Button title="Zakaži termin" onPress={handleBook} disabled={!canSubmit} loading={loading} />
        </GlassCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md, paddingBottom: spacing.md },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xs, marginBottom: spacing.md },
  calendar: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: 'transparent' },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 60,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
});
