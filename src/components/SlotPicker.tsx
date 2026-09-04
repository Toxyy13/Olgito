import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { addMinutesToTime } from '../utils/time';
import { SLOT_MINUTES, type DayHours } from '../types';
import type { DaySlot } from '../hooks/useAvailability';

interface Props {
  dayHours: DayHours | null;
  allSlots: DaySlot[];
  availableStarts: string[];
  peopleCount: number;
  selectedStart: string | null;
  onSelect: (start: string) => void;
}

export function SlotPicker({ dayHours, allSlots, availableStarts, peopleCount, selectedStart, onSelect }: Props) {
  // Kad je termin izabran, ovoliko uzastopnih 30-min pozicija (koliko osoba,
  // toliko slotova) treba da bude vizuelno istaknuto kao "rezervisano".
  const highlightedSlots = useMemo(() => {
    if (!selectedStart) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < peopleCount; i++) {
      set.add(addMinutesToTime(selectedStart, i * SLOT_MINUTES));
    }
    return set;
  }, [selectedStart, peopleCount]);

  return (
    <View>
      {peopleCount > 1 && availableStarts.length > 0 && (
        <Text style={styles.hint}>Termin traje {peopleCount * SLOT_MINUTES} min — obeleženo je {peopleCount} termina.</Text>
      )}
      {dayHours?.closed ? (
        <Text style={styles.closed}>Olgica ne radi ovog dana 🌴</Text>
      ) : availableStarts.length === 0 ? (
        <Text style={styles.closed}>Nema slobodnih termina za izabrani broj osoba.</Text>
      ) : (
        <View style={styles.chipsRow}>
          {allSlots.map(({ start: t, busy }) => {
            const isSelectableStart = availableStarts.includes(t);
            const isHighlighted = highlightedSlots.has(t);
            const isDisabled = busy || !isSelectableStart;
            return (
              <Pressable
                key={t}
                disabled={isDisabled}
                onPress={() => onSelect(t)}
                style={[styles.chip, isDisabled && styles.chipDisabled, isHighlighted && styles.chipActive]}
              >
                <Text style={[styles.chipText, isDisabled && styles.chipTextDisabled, isHighlighted && styles.chipTextActive]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textSecondary, ...typography.small, marginBottom: spacing.sm },
  closed: { color: colors.textSecondary, ...typography.body },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,210,63,0.7)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: colors.accent, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  chipDisabled: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.glassBorder, opacity: 1 },
  chipText: { color: colors.background, ...typography.small, fontFamily: typography.smallMedium.fontFamily },
  chipTextActive: { color: colors.background, fontFamily: typography.bodyBold.fontFamily },
  chipTextDisabled: { color: 'rgba(255,255,255,0.45)', textDecorationLine: 'line-through' },
});
