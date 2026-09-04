import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { Button } from '../../../src/components/Button';
import { useAppAlert } from '../../../src/context/AlertContext';
import { colors, radius, spacing, typography, calendarTheme } from '../../../src/theme';
import {
  watchWeeklyDefault,
  setDayHours,
  getOverride,
  setOverride,
  clearOverride,
  getBlockedSlotsForDate,
  addBlockedSlot,
  removeBlockedSlot,
} from '../../../src/api/workingHours';
import type { WeeklyDefaultHours, Weekday, BlockedSlot } from '../../../src/types';
import { todayISO, formatDateLong } from '../../../src/utils/time';
import { useClosedDatesForMonth } from '../../../src/hooks/useClosedDates';
import { buildClosedDayMarks } from '../../../src/utils/calendarMarks';

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Ponedeljak' },
  { key: 'tue', label: 'Utorak' },
  { key: 'wed', label: 'Sreda' },
  { key: 'thu', label: 'Četvrtak' },
  { key: 'fri', label: 'Petak' },
  { key: 'sat', label: 'Subota' },
  { key: 'sun', label: 'Nedelja' },
];

export default function WorkingHoursScreen() {
  const { alert } = useAppAlert();
  const [weekly, setWeekly] = useState<WeeklyDefaultHours | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [monthAnchor, setMonthAnchor] = useState(todayISO());
  const [closedDatesRefreshKey, setClosedDatesRefreshKey] = useState(0);
  const closedDates = useClosedDatesForMonth(monthAnchor, closedDatesRefreshKey);
  const [overrideClosed, setOverrideClosed] = useState<boolean | null>(null);
  const [overrideStart, setOverrideStart] = useState('09:00');
  const [overrideEnd, setOverrideEnd] = useState('17:00');
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [blockStart, setBlockStart] = useState('13:00');
  const [blockEnd, setBlockEnd] = useState('14:00');

  useEffect(() => watchWeeklyDefault(setWeekly), []);

  useEffect(() => {
    getOverride(selectedDate).then((o) => {
      if (o) {
        setOverrideClosed(o.closed);
        setOverrideStart(o.start ?? '09:00');
        setOverrideEnd(o.end ?? '17:00');
      } else {
        setOverrideClosed(null);
      }
    });
    getBlockedSlotsForDate(selectedDate).then(setBlocked);
  }, [selectedDate]);

  const updateWeekday = async (key: Weekday, patch: Partial<{ closed: boolean; start: string; end: string }>) => {
    if (!weekly) return;
    const next = { ...weekly[key], ...patch };
    setWeekly({ ...weekly, [key]: next });
    try {
      await setDayHours(key, next);
      setClosedDatesRefreshKey((k) => k + 1);
    } catch {
      setWeekly(weekly);
      alert('Greška', 'Radno vreme nije sačuvano. Pokušaj ponovo.');
    }
  };

  const handleSaveOverride = async (closed: boolean) => {
    try {
      await setOverride({ date: selectedDate, closed, start: overrideStart, end: overrideEnd });
      setOverrideClosed(closed);
      setClosedDatesRefreshKey((k) => k + 1);
    } catch {
      alert('Greška', 'Izuzetak nije sačuvan. Pokušaj ponovo.');
    }
  };

  const handleClearOverride = async () => {
    try {
      await clearOverride(selectedDate);
      setOverrideClosed(null);
      setClosedDatesRefreshKey((k) => k + 1);
    } catch {
      alert('Greška', 'Izuzetak nije uklonjen. Pokušaj ponovo.');
    }
  };

  const handleAddBlock = async () => {
    if (blockStart >= blockEnd) {
      alert('Neispravno vreme', 'Početak pauze mora biti pre kraja.');
      return;
    }
    try {
      await addBlockedSlot({ date: selectedDate, startTime: blockStart, endTime: blockEnd });
      setBlocked(await getBlockedSlotsForDate(selectedDate));
    } catch {
      alert('Greška', 'Pauza nije dodata. Pokušaj ponovo.');
    }
  };

  const handleRemoveBlock = async (id: string) => {
    try {
      await removeBlockedSlot(id);
      setBlocked(await getBlockedSlotsForDate(selectedDate));
    } catch {
      alert('Greška', 'Pauza nije uklonjena. Pokušaj ponovo.');
    }
  };

  return (
    <ScreenContainer scroll showBack>
      <ScreenHeader eyebrow="Salon" title="Radno vreme" />

      <Text style={styles.section}>Nedeljni raspored (ponavlja se)</Text>
      {weekly &&
        WEEKDAYS.map(({ key, label }) => {
          const day = weekly[key];
          return (
            <View key={key} style={styles.dayRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayLabel}>{label}</Text>
                {!day.closed && (
                  <View style={styles.timeRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={day.start}
                      onChangeText={(t) => updateWeekday(key, { start: t })}
                    />
                    <Text style={styles.dash}>–</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={day.end}
                      onChangeText={(t) => updateWeekday(key, { end: t })}
                    />
                  </View>
                )}
              </View>
              <Switch
                value={!day.closed}
                onValueChange={(val) => updateWeekday(key, { closed: !val })}
                trackColor={{ true: colors.secondary, false: colors.border }}
              />
            </View>
          );
        })}

      <Text style={styles.section}>Izuzetak za konkretan datum</Text>
      <Calendar
        current={selectedDate}
        onDayPress={(d) => setSelectedDate(d.dateString)}
        onMonthChange={(m) => setMonthAnchor(m.dateString)}
        markingType="custom"
        markedDates={buildClosedDayMarks(closedDates, selectedDate)}
        theme={calendarTheme}
        style={styles.calendar}
      />
      <View style={styles.card}>
        {overrideClosed !== null && (
          <Text style={styles.overrideStatus}>
            {overrideClosed ? 'Ovaj dan je označen kao slobodan.' : `Radno vreme za ovaj dan: ${overrideStart}–${overrideEnd}`}
          </Text>
        )}
        <View style={styles.timeRow}>
          <TextInput style={styles.timeInput} value={overrideStart} onChangeText={setOverrideStart} />
          <Text style={styles.dash}>–</Text>
          <TextInput style={styles.timeInput} value={overrideEnd} onChangeText={setOverrideEnd} />
        </View>
        <View style={styles.actionsRow}>
          <Button title="Postavi radno vreme" variant="secondary" onPress={() => handleSaveOverride(false)} />
          <Button title="Ceo dan slobodan" variant="danger" onPress={() => handleSaveOverride(true)} />
        </View>
        {overrideClosed !== null && <Button title="Ukloni izuzetak" variant="outline" onPress={handleClearOverride} />}
      </View>

      <Text style={styles.section}>Pauze u toku dana ({formatDateLong(selectedDate)})</Text>
      <View style={styles.card}>
        {blocked.map((b) => (
          <View key={b.id} style={styles.blockRow}>
            <Text style={styles.blockText}>
              {b.startTime}–{b.endTime}
            </Text>
            <Button title="Ukloni" variant="outline" onPress={() => handleRemoveBlock(b.id)} />
          </View>
        ))}
        <View style={styles.timeRow}>
          <TextInput style={styles.timeInput} value={blockStart} onChangeText={setBlockStart} />
          <Text style={styles.dash}>–</Text>
          <TextInput style={styles.timeInput} value={blockEnd} onChangeText={setBlockEnd} />
        </View>
        <Button title="Dodaj pauzu" onPress={handleAddBlock} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  section: { ...typography.bodyBold, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dayLabel: { ...typography.body, color: colors.textPrimary, marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 70,
    color: colors.textPrimary,
    backgroundColor: colors.inputBg,
    textAlign: 'center',
  },
  dash: { color: colors.textSecondary },
  calendar: { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  overrideStatus: { color: colors.textSecondary, ...typography.small },
  actionsRow: { gap: spacing.sm },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  blockText: { color: colors.textPrimary, ...typography.body },
});
