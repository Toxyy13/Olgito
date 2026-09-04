import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { EyebrowLabel } from './EyebrowLabel';

interface Props {
  title: string;
  eyebrow?: string;
  description?: string;
}

// "Page hero" — mala eyebrow oznaka + veliki naslov (+ opciono opis), ispod
// stalne brend trake iz ScreenContainer-a.
export function ScreenHeader({ title, eyebrow, description }: Props) {
  return (
    <View style={styles.header}>
      {!!eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  title: { ...typography.h1, color: colors.textPrimary },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
});
