import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { EyebrowLabel } from './EyebrowLabel';
import { Logo } from './Logo';
import { colors, radius, spacing, typography, fonts } from '../theme';

export interface SideMenuItem {
  name: string; // ime fajla rute (npr. "calendar") — koristi se i za navigaciju i za prepoznavanje trenutne stranice
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  badge?: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  groupPath: string; // npr. "/(client)" ili "/(admin)"
  items: SideMenuItem[];
}

export function SideMenu({ visible, onClose, groupPath, items }: Props) {
  const router = useRouter();
  const segments = useSegments();
  const currentName = segments[segments.length - 1];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <View style={styles.brandRow}>
            <Logo size={44} />
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandName}>Olgito</Text>
              <Text style={styles.brandSubtitle}>SALON · TROPSKA LINIJA</Text>
            </View>
            <Pressable style={styles.closeCircle} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={colors.textOnPrimary} />
            </Pressable>
          </View>

          <GlassCard style={styles.card} padded={false}>
            <View style={styles.cardInner}>
              <EyebrowLabel>Meni</EyebrowLabel>
              <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                {items.map((item) => {
                  const active = item.name === currentName;
                  return (
                    <Pressable
                      key={item.name}
                      style={[styles.tile, active ? styles.tileActive : styles.tileInactive]}
                      onPress={() => {
                        onClose();
                        router.replace(`${groupPath}/${item.name}` as any);
                      }}
                    >
                      {!!item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                        <Ionicons name={item.icon} size={20} color={colors.textOnPrimary} />
                      </View>
                      <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 420, maxHeight: '88%' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  brandTextWrap: { flex: 1 },
  brandName: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.textPrimary },
  brandSubtitle: { ...typography.mono, fontSize: 10, color: colors.textSecondary, letterSpacing: 1.5 },
  closeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { flexShrink: 1 },
  cardInner: { padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tile: {
    width: '47%',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  tileActive: { backgroundColor: colors.primary, borderColor: 'rgba(255,210,63,0.8)', borderWidth: 2 },
  tileInactive: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.glassBorder },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  tileLabel: { ...typography.smallMedium, color: colors.textPrimary, textAlign: 'center' },
  tileLabelActive: { fontFamily: fonts.headingSemibold },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.statusOtkazano,
    borderRadius: radius.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: { ...typography.mono, fontSize: 10, color: colors.textOnPrimary },
});
