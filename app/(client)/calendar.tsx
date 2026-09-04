import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography, calendarTheme } from '../../src/theme';
import { getEffectiveDayHours } from '../../src/api/workingHours';
import { watchBusyRanges, type AvailabilityRange } from '../../src/api/availability';
import { generateSlotStarts, addMinutesToTime, rangesOverlap } from '../../src/utils/time';
import { SLOT_MINUTES, type DayHours } from '../../src/types';
import { useClosedDatesForMonth } from '../../src/hooks/useClosedDates';
import { buildClosedDayMarks } from '../../src/utils/calendarMarks';

LocaleConfig.locales['sr'] = {
  monthNames: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
  dayNames: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'],
  dayNamesShort: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'],
  today: 'Danas',
};
LocaleConfig.defaultLocale = 'sr';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ClientCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [monthAnchor, setMonthAnchor] = useState(todayISO());
  const [dayHours, setDayHours] = useState<DayHours | null>(null);
  const [busyRanges, setBusyRanges] = useState<AvailabilityRange[]>([]);
  const closedDates = useClosedDatesForMonth(monthAnchor);

  useEffect(() => {
    let cancelled = false;
    getEffectiveDayHours(selectedDate).then((h) => {
      if (!cancelled) setDayHours(h);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    const unsub = watchBusyRanges(selectedDate, setBusyRanges);
    return unsub;
  }, [selectedDate]);

  const slots = useMemo(() => {
    if (!dayHours || dayHours.closed) return [];
    return generateSlotStarts(dayHours.start, dayHours.end).map((start) => {
      const end = addMinutesToTime(start, SLOT_MINUTES);
      const busy = busyRanges.some((r) => rangesOverlap(r, { startTime: start, endTime: end }));
      return { start, end, busy };
    });
  }, [dayHours, busyRanges]);

  // Kalendar (i "zatvoreno" poruka) žive u ListHeaderComponent-u tako da CEO
  // ekran ima jedan vlasnik skrola (FlatList) — bitno na malim telefonima.
  return (
    <ScreenContainer>
      <FlatList
        style={{ flex: 1 }}
        data={dayHours?.closed ? [] : slots}
        keyExtractor={(item) => item.start}
        numColumns={3}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <ScreenHeader eyebrow="Slobodni termini" title="Kalendar" />
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
            {dayHours?.closed && <Text style={styles.closed}>Olgica ne radi ovog dana 🌴</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.slot, item.busy ? styles.slotBusy : styles.slotFree]}>
            <Text style={item.busy ? styles.slotBusyText : styles.slotFreeText}>{item.start}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  calendar: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.sm },
  closed: { ...typography.bodyBold, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  slot: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  slotFree: { backgroundColor: colors.slotSlobodan, borderWidth: 1, borderColor: colors.slotSlobodanBorder },
  slotBusy: { backgroundColor: colors.slotZauzet },
  slotFreeText: { color: colors.textOnPrimary, ...typography.small, fontWeight: '700' },
  slotBusyText: { color: colors.textOnPrimary, ...typography.small },
});
