import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { getAppointmentsForRange } from '../../../src/api/appointments';
import { watchAllServices } from '../../../src/api/services';
import type { Appointment, ServiceType } from '../../../src/types';

const MONTH_NAMES = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

type Period = 'day' | 'week' | 'month';

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Nedelja počinje ponedeljkom.
function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const res = new Date(d);
  res.setDate(d.getDate() + diff);
  return res;
}

function rangeFor(period: Period, anchor: Date): { from: Date; to: Date } {
  if (period === 'day') return { from: anchor, to: anchor };
  if (period === 'week') {
    const from = startOfWeek(anchor);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from, to };
  }
  const from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const to = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { from, to };
}

function shiftAnchor(period: Period, anchor: Date, dir: 1 | -1): Date {
  const d = new Date(anchor);
  if (period === 'day') d.setDate(d.getDate() + dir);
  else if (period === 'week') d.setDate(d.getDate() + dir * 7);
  else d.setMonth(d.getMonth() + dir);
  return d;
}

function labelFor(period: Period, from: Date, to: Date): string {
  if (period === 'day') return `${from.getDate()}. ${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}.`;
  if (period === 'week') {
    const sameMonth = from.getMonth() === to.getMonth();
    return sameMonth
      ? `${from.getDate()}–${to.getDate()}. ${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}.`
      : `${from.getDate()}. ${MONTH_NAMES[from.getMonth()]} – ${to.getDate()}. ${MONTH_NAMES[to.getMonth()]} ${to.getFullYear()}.`;
  }
  return `${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}.`;
}

export default function EarningsScreen() {
  const [period, setPeriod] = useState<Period>('day');
  const [anchor, setAnchor] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);

  const { from, to } = useMemo(() => rangeFor(period, anchor), [period, anchor]);

  useEffect(() => watchAllServices(setServices), []);

  useEffect(() => {
    setLoading(true);
    getAppointmentsForRange(toISO(from), toISO(to))
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, [from.getTime(), to.getTime()]);

  const priceFor = (item: Appointment) => {
    const perPerson = item.serviceIds.reduce((sum, id) => sum + (services.find((s) => s.id === id)?.price ?? 0), 0);
    return perPerson * item.peopleCount;
  };

  const active = appointments.filter((a) => a.status !== 'otkazano');
  const total = active.reduce((sum, a) => sum + priceFor(a), 0);

  return (
    <ScreenContainer>
      <ScreenHeader title="Zarada" />

      <View style={styles.tabs}>
        {(['day', 'week', 'month'] as Period[]).map((p) => (
          <Pressable
            key={p}
            style={[styles.tab, period === p && styles.tabActive]}
            onPress={() => {
              setPeriod(p);
              setAnchor(new Date());
            }}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
              {p === 'day' ? 'Dan' : p === 'week' ? 'Nedelja' : 'Mesec'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.nav}>
        <Pressable onPress={() => setAnchor(shiftAnchor(period, anchor, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textOnPrimary} />
        </Pressable>
        <Text style={styles.navLabel}>{labelFor(period, from, to)}</Text>
        <Pressable onPress={() => setAnchor(shiftAnchor(period, anchor, 1))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.textOnPrimary} />
        </Pressable>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Ukupna zarada</Text>
        <Text style={styles.totalValue}>{loading ? '...' : `${total} RSD`}</Text>
        <Text style={styles.totalCount}>
          {active.length} {active.length === 1 ? 'termin' : 'termina'}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, ...typography.bodyBold },
  tabTextActive: { color: colors.textOnPrimary },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navLabel: { ...typography.bodyBold, color: colors.textPrimary },
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  totalLabel: { color: colors.textSecondary, ...typography.body },
  totalValue: { color: colors.textOnPrimary, ...typography.h1, fontSize: 40 },
  totalCount: { color: colors.textSecondary, ...typography.small },
});
