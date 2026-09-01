import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Podešavanja" />

      <View style={styles.content}>
        <MenuItem
          icon="time"
          label="Radno vreme"
          subtitle="Nedeljni raspored, slobodni dani, pauze"
          onPress={() => router.push('/(admin)/settings/working-hours')}
        />
        <MenuItem
          icon="pricetag"
          label="Usluge i cenovnik"
          subtitle="Dodaj usluge i uredi cene"
          onPress={() => router.push('/(admin)/settings/services')}
        />
        <MenuItem
          icon="cash"
          label="Zarada"
          subtitle="Ukupna zarada po danu, nedelji i mesecu"
          onPress={() => router.push('/(admin)/settings/earnings')}
        />
        <MenuItem
          icon="close-circle"
          label="Odbijeni klijenti"
          subtitle="Nalozi koje si odbila"
          onPress={() => router.push('/(admin)/settings/rejected-clients')}
        />
      </View>

      <Pressable style={styles.logout} onPress={logout}>
        <Ionicons name="log-out" size={20} color={colors.textOnPrimary} />
        <Text style={styles.logoutText}>Odjavi se</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.textOnPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { ...typography.bodyBold, color: colors.textPrimary },
  itemSubtitle: { color: colors.textSecondary, ...typography.small },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  logoutText: { color: colors.textOnPrimary, ...typography.bodyBold },
});
