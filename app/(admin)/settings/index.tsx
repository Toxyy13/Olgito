import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../src/components/ScreenContainer';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { GlassCard } from '../../../src/components/GlassCard';
import { UpdateChecker } from '../../../src/components/UpdateChecker';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, radius, spacing, typography, fonts } from '../../../src/theme';

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScreenContainer scroll>
      <ScreenHeader eyebrow="Salon" title="Podešavanja" />

      <View style={styles.grid}>
        <MenuTile
          icon="time"
          label="Radno vreme"
          subtitle="Nedeljni raspored, slobodni dani, pauze"
          onPress={() => router.push('/(admin)/settings/working-hours')}
        />
        <MenuTile
          icon="pricetag"
          label="Usluge i cenovnik"
          subtitle="Dodaj usluge i uredi cene"
          onPress={() => router.push('/(admin)/settings/services')}
        />
        <MenuTile
          icon="cash"
          label="Zarada"
          subtitle="Ukupna zarada po danu, nedelji i mesecu"
          onPress={() => router.push('/(admin)/settings/earnings')}
        />
        <MenuTile
          icon="close-circle"
          label="Odbijeni klijenti"
          subtitle="Nalozi koje si odbila"
          onPress={() => router.push('/(admin)/settings/rejected-clients')}
        />
      </View>

      <UpdateChecker />

      <Pressable style={styles.logout} onPress={logout}>
        <Ionicons name="log-out" size={20} color={colors.textOnPrimary} />
        <Text style={styles.logoutText}>Odjavi se</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function MenuTile({
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
    <Pressable style={styles.tileWrap} onPress={onPress}>
      <GlassCard style={styles.tile}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={colors.textOnPrimary} />
        </View>
        <Text style={styles.tileLabel} numberOfLines={2}>{label}</Text>
        <Text style={styles.tileSubtitle} numberOfLines={3}>{subtitle}</Text>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  tileWrap: { width: '47%', height: 168 },
  tile: { flex: 1, gap: spacing.xs },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tileLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textPrimary },
  tileSubtitle: { color: colors.textSecondary, ...typography.small, fontSize: 12, lineHeight: 16 },
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
