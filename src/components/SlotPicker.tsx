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
      <Text style={styles.label}>Slobodni termini</Text>
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
  label: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },
  hint: { color: colors.textSecondary, ...typography.small, marginBottom: spacing.sm },
  closed: { color: colors.textSecondary, ...typography.body },
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
  chipDisabled: { backgroundColor: colors.slotZauzet, borderColor: colors.slotZauzet, opacity: 0.6 },
  chipText: { color: colors.textPrimary, ...typography.small },
  chipTextActive: { color: colors.textOnPrimary, fontWeight: '700' },
  chipTextDisabled: { color: colors.textSecondary },
});
