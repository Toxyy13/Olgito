import React from 'react';
import { Text, StyleSheet, type TextStyle, type StyleProp } from 'react-native';
import { colors, typography } from '../theme';

// Mala razmaknuta oznaka VELIKIM SLOVIMA iznad naslova (npr. "PREGLED", "KORAK 1 — USLUGA").
export function EyebrowLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.text, style]}>{typeof children === 'string' ? children.toUpperCase() : children}</Text>;
}

const styles = StyleSheet.create({
  text: { ...typography.eyebrow, color: colors.accent },
});
