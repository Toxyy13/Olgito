import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, typography } from '../theme';
import { useNavMenu } from '../context/NavMenuContext';
import { Logo } from './Logo';

export function ScreenContainer({
  children,
  scroll = false,
  showBack = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  showBack?: boolean;
}) {
  const { open } = useNavMenu();
  const router = useRouter();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <Logo size={44} />
          <View>
            <Text style={styles.brandName}>Olgito</Text>
            <Text style={styles.brandSubtitle}>SALON · TROPSKA LINIJA</Text>
          </View>
        </View>
        <Pressable onPress={showBack ? () => router.back() : open} style={styles.menuCircle} hitSlop={10}>
          <Ionicons name={showBack ? 'arrow-back' : 'menu'} size={20} color={colors.textOnPrimary} />
        </Pressable>
      </View>
      <Container style={styles.inner} contentContainerStyle={scroll ? styles.scrollContent : undefined}>
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandName: { fontFamily: fonts.heading, fontSize: 18, color: colors.textPrimary },
  brandSubtitle: { ...typography.mono, fontSize: 10, color: colors.textSecondary, letterSpacing: 1 },
  menuCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, flexGrow: 1 },
});
