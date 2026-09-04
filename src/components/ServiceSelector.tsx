import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { EyebrowLabel } from './EyebrowLabel';
import { colors, radius, spacing, typography } from '../theme';
import type { ServiceType } from '../types';

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  services: ServiceType[];
  selectedServiceIds: string[];
  onToggleService: (id: string) => void;
  peopleCount: number;
  onPeopleCountChange: (count: number) => void;
}

export function ServiceSelector({
  eyebrow,
  title,
  description,
  services,
  selectedServiceIds,
  onToggleService,
  peopleCount,
  onPeopleCountChange,
}: Props) {
  return (
    <GlassCard>
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}

      <View style={styles.list}>
        {services.map((s) => {
          const active = selectedServiceIds.includes(s.id);
          return (
            <Pressable
              key={s.id}
              onPress={() => onToggleService(s.id)}
              style={[styles.row, active ? styles.rowActive : styles.rowInactive]}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowName}>{s.name}</Text>
              </View>
              <Text style={styles.rowPrice}>{s.price} RSD</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.peopleRow}>
        <Text style={styles.peopleLabel}>Broj osoba</Text>
        <View style={styles.stepperPill}>
          <Pressable style={styles.stepBtn} onPress={() => onPeopleCountChange(Math.max(1, peopleCount - 1))}>
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <View style={styles.stepValueWrap}>
            <Text style={styles.stepValue}>{peopleCount}</Text>
          </View>
          <Pressable style={styles.stepBtn} onPress={() => onPeopleCountChange(Math.min(6, peopleCount + 1))}>
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, fontSize: 26, color: colors.textPrimary, marginTop: spacing.xs },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  list: { marginTop: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  rowActive: { backgroundColor: colors.primary, borderWidth: 2, borderColor: 'rgba(255,210,63,0.8)' },
  rowInactive: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.glassBorder },
  rowLeft: { gap: 2 },
  rowName: { ...typography.bodyBold, color: colors.textPrimary },
  rowMeta: { ...typography.mono, fontSize: 11, color: colors.textSecondary },
  rowPrice: { ...typography.statNumber, fontSize: 16, color: colors.textPrimary },
  peopleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  peopleLabel: { ...typography.bodyBold, color: colors.textPrimary },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glassBg,
    borderRadius: radius.pill,
    padding: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: colors.textOnPrimary, fontSize: 18, fontFamily: typography.bodyBold.fontFamily },
  stepValueWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { ...typography.statNumber, fontSize: 14, color: colors.background },
});
