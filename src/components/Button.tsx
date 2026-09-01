import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const isOutline = variant === 'outline';
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
      ? colors.secondary
      : variant === 'danger'
      ? colors.danger
      : 'transparent';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        isOutline && { borderWidth: 2, borderColor: colors.primary },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.textOnPrimary} />
      ) : (
        <Text style={[styles.text, isOutline && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
  },
});
