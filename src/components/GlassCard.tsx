import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

// "Staklena" kartica — providna bela preko tamnozelene pozadine sa blur
// efektom, kao brend/hero delovi ekrana u referentnom dizajnu.
export function GlassCard({ children, style, padded = true }: Props) {
  return (
    <View style={[styles.wrap, padded && styles.padded, style]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    backgroundColor: colors.glassBg,
  },
  padded: { padding: spacing.lg },
  overlay: { backgroundColor: colors.glassBg },
  // Bez ovoga, apsolutno pozicionirani BlurView/overlay se na webu (po CSS
  // pravilima za stacking) crtaju IZNAD ove, običnim tokom pozicionirane,
  // dece — pa tekst i input polja izgledaju zamućeno iako je blur samo
  // trebalo da bude pozadina. Eksplicitan zIndex ovo popravlja.
  content: { position: 'relative', zIndex: 1 },
});
