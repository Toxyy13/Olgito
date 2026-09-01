import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps, GestureResponderEvent } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { useClickSound } from '../hooks/useClickSound';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, disabled, onPress, ...rest }: ButtonProps) {
  const playClick = useClickSound();
  const isOutline = variant === 'outline';
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
      ? colors.secondary
      : variant === 'danger'
      ? colors.danger
      : 'transparent';

  const handlePress = (e: GestureResponderEvent) => {
    playClick();
    onPress?.(e);
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        isOutline && { borderWidth: 2, borderColor: colors.textOnPrimary },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnPrimary} />
      ) : (
        <Text style={styles.text}>{title}</Text>
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
