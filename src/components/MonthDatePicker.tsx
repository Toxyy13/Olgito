import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, fonts } from '../theme';

const MONTH_NAMES = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

interface Props {
  current: string;
  minDate?: string;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
  markingType?: any;
  markedDates?: Record<string, any>;
  theme?: any;
  style?: any;
}

// Dvokorakov izbor datuma: prvo se bira mesec, tek kad je mesec potvrđen
// prikazuje se mrežа dana tog meseca za izbor konkretnog datuma.
export function MonthDatePicker({ current, minDate, onDayPress, onMonthChange, markingType, markedDates, theme, style }: Props) {
  const [monthAnchor, setMonthAnchor] = useState(`${current.slice(0, 7)}-01`);
  const [monthPicked, setMonthPicked] = useState(false);

  const shiftMonth = (delta: number) => {
    const d = new Date(`${monthAnchor}T00:00:00`);
    d.setMonth(d.getMonth() + delta);
    const next = d.toISOString().slice(0, 10);
    if (minDate && next.slice(0, 7) < minDate.slice(0, 7)) return;
    setMonthAnchor(next);
    onMonthChange?.({ dateString: next });
  };

  const monthLabel = () => {
    const d = new Date(`${monthAnchor}T00:00:00`);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (!monthPicked) {
    return (
      <View>
        <View style={styles.monthNav}>
          <Pressable style={styles.navBtn} onPress={() => shiftMonth(-1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={colors.textOnPrimary} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel()}</Text>
          <Pressable style={styles.navBtn} onPress={() => shiftMonth(1)} hitSlop={8}>
            <Ionicons name="chevron-forward" size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>
        <Pressable style={styles.confirmBtn} onPress={() => setMonthPicked(true)}>
          <Text style={styles.confirmText}>Izaberi datum u ovom mesecu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <Pressable style={styles.backRow} onPress={() => setMonthPicked(false)} hitSlop={8}>
        <Ionicons name="chevron-back" size={14} color={colors.accent} />
        <Text style={styles.backText}>{monthLabel()} — promeni mesec</Text>
      </Pressable>
      <Calendar
        current={monthAnchor}
        minDate={minDate}
        onDayPress={onDayPress}
        onMonthChange={(m: any) => {
          setMonthAnchor(m.dateString);
          onMonthChange?.(m);
        }}
        markingType={markingType}
        markedDates={markedDates}
        theme={theme}
        style={style}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { ...typography.h3, color: colors.textPrimary },
  confirmBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textOnPrimary },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  backText: { ...typography.mono, fontSize: 11, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
});
